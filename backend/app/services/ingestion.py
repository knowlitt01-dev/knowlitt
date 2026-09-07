"""
PDF text extraction, OCR fallback for scanned PDFs, and chunking.

OCR uses Tesseract (via pytesseract + pdf2image), which runs entirely
locally — no API key, no external account, no per-page cost. This requires
the `tesseract-ocr` and `poppler-utils` system packages to be installed
(already handled in the Dockerfile; see README for local/non-Docker setup).
"""
import logging
from io import BytesIO

from pypdf import PdfReader
from pypdf.errors import PdfReadError

logger = logging.getLogger("booktutor.ingestion")

# Below this fraction of pages having extractable text, treat the PDF as
# scanned/image-based and route to OCR instead of failing outright.
SCANNED_THRESHOLD = 0.1

# OCR is capped at this many pages to keep processing time and server load
# bounded for a synchronous request — large scans should ideally move to a
# background job (see README "Known limitations").
MAX_OCR_PAGES = 60


class IngestionError(Exception):
    """Raised for a file that can't be processed at all (corrupted,
    password-protected, empty). Carries a stable `code` so the frontend can
    show tailored messaging instead of parsing the string."""

    def __init__(self, message: str, code: str = "processing_failed"):
        super().__init__(message)
        self.code = code


def _open_pdf(file_bytes: bytes, filename: str) -> PdfReader:
    try:
        reader = PdfReader(BytesIO(file_bytes))
    except PdfReadError as e:
        logger.warning("Failed to open PDF %s: %s", filename, e)
        raise IngestionError(
            "This file couldn't be opened as a PDF — it may be corrupted.",
            code="corrupted_file",
        ) from e

    if reader.is_encrypted:
        try:
            reader.decrypt("")  # some "protected" PDFs use an empty password
        except Exception as e:
            raise IngestionError(
                "This PDF is password-protected and can't be processed.",
                code="password_protected",
            ) from e

    return reader


def extract_text_layer(file_bytes: bytes, filename: str) -> tuple[str, bool]:
    """Extracts text if the PDF has a real text layer. Returns
    (text, is_scanned) — is_scanned=True means the caller should route to
    run_ocr() next rather than treating this as a failure."""
    reader = _open_pdf(file_bytes, filename)

    if len(reader.pages) == 0:
        raise IngestionError("This PDF has no pages.", code="empty_file")

    pages_text = []
    for i, page in enumerate(reader.pages):
        try:
            text = page.extract_text() or ""
        except Exception as e:
            logger.warning("Failed extracting page %d of %s: %s", i, filename, e)
            text = ""
        pages_text.append(text)

    full_text = "\n".join(pages_text).strip()
    non_empty_pages = sum(1 for t in pages_text if t.strip())
    fraction_with_text = non_empty_pages / len(reader.pages)

    logger.info(
        "%s: %d pages, %d with extractable text (%.0f%%), %d total chars",
        filename, len(reader.pages), non_empty_pages, fraction_with_text * 100, len(full_text),
    )

    is_scanned = fraction_with_text < SCANNED_THRESHOLD
    return full_text, is_scanned


def run_ocr(file_bytes: bytes, filename: str) -> str:
    """OCR fallback for scanned/image-based PDFs using Tesseract. Raises
    IngestionError with a clear, stable code if OCR itself fails or the
    document exceeds the page cap."""
    try:
        import pytesseract
        from pdf2image import convert_from_bytes
    except ImportError as e:
        logger.error("OCR dependencies not installed: %s", e)
        raise IngestionError(
            "OCR isn't available on this server yet — the required packages aren't installed.",
            code="ocr_unavailable",
        ) from e

    reader = _open_pdf(file_bytes, filename)
    page_count = len(reader.pages)

    if page_count > MAX_OCR_PAGES:
        raise IngestionError(
            f"This scanned document has {page_count} pages, which exceeds the "
            f"{MAX_OCR_PAGES}-page OCR limit. Try splitting it into smaller files.",
            code="ocr_page_limit_exceeded",
        )

    try:
        images = convert_from_bytes(file_bytes, dpi=200)
    except Exception as e:
        logger.exception("pdf2image conversion failed for %s", filename)
        raise IngestionError(
            "Couldn't convert this PDF's pages to images for OCR processing.",
            code="ocr_conversion_failed",
        ) from e

    page_texts = []
    for i, image in enumerate(images):
        try:
            text = pytesseract.image_to_string(image)
            page_texts.append(text)
        except Exception as e:
            logger.warning("OCR failed on page %d of %s: %s", i, filename, e)
            page_texts.append("")

    full_text = "\n".join(page_texts).strip()
    logger.info("OCR complete for %s: %d pages, %d chars extracted", filename, page_count, len(full_text))

    if len(full_text) < 100:
        raise IngestionError(
            "OCR completed but couldn't extract readable text from this document. "
            "It may be low-quality scans or a non-text format (e.g. photos/diagrams only).",
            code="ocr_no_text_found",
        )

    return full_text


def chunk_text(text: str, target_chars: int = 3000) -> list[str]:
    """Split into rough sections on paragraph boundaries, ~target_chars each."""
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    sections: list[str] = []
    current: list[str] = []
    current_len = 0

    for para in paragraphs:
        current.append(para)
        current_len += len(para)
        if current_len >= target_chars:
            sections.append("\n".join(current))
            current, current_len = [], 0

    if current:
        sections.append("\n".join(current))

    return [s for s in sections if len(s) > 100]
