# Security Considerations for BookTutor

This MVP was built with a security-first mindset. Here's what's in place and what to harden before production use.

## What's Implemented

- ✅ **JWT-based auth** — passwords hashed with bcrypt, tokens expire after 7 days
- ✅ **User isolation** — server-side auth checks on every endpoint, never trusts client-passed user_id
- ✅ **CORS locked down** — only your frontend origin is allowed (set in `FRONTEND_ORIGIN` env var)
- ✅ **Input validation** — file size limits, file type checks, email format validation
- ✅ **Error handling** — no stack traces leaked to clients; clear user-facing errors only
- ✅ **SQLite/PostgreSQL** — parameterized queries everywhere, no string interpolation in SQL
- ✅ **No secrets in code** — all credentials via environment variables

## Before Going to Production

1. **HTTPS only** — Always use HTTPS for your deployed URLs. Most hosting (Railway, Vercel) auto-includes this.

2. **Strong JWT secret** — `JWT_SECRET` must be a long random string (32+ chars):
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **Database security**
   - Use PostgreSQL in production, not SQLite (easier to backup/scale)
   - Use Supabase or a managed PostgreSQL service
   - Enable SSL connections to the DB

4. **Rate limiting** — The MVP doesn't have rate limiting yet. Add it before launch if you expect heavy traffic:
   - Use `slowapi` (FastAPI rate limiting library) on auth + upload endpoints
   - See the security prompt in `booktutor-admin-security-prompts.md` for details

5. **Logging & monitoring**
   - Don't log passwords, tokens, or phone numbers
   - Monitor for unusual access patterns (lots of failed auth, rapid uploads from one IP)
   - Set up alerts for backend errors (use your hosting's built-in logging)

6. **File uploads** — The current code:
   - Limits files to 40MB
   - Checks file extension + magic bytes for PDFs
   - Rejects corrupted/encrypted PDFs with clear errors
   - **But:** No antivirus scanning. For production, consider scanning uploads with ClamAV or a commercial service

7. **Third-party APIs** — If you add Groq, WhatsApp, Telegram, Razorpay:
   - Never log full API keys (only the last 4 chars if needed)
   - Validate webhook signatures (see `booktutor-whatsapp-prompt.md` for examples)
   - Use separate API keys for dev/prod environments

## Sensitive Routes

These routes handle user data or payments:

```
POST /auth/signup           — password sent, must be HTTPS
POST /auth/login            — password sent, must be HTTPS
POST /books/upload          — files uploaded, validate thoroughly
PATCH /users/me/whatsapp    — phone numbers stored
POST /billing/webhook       — payment confirmations, signature verify critical
```

All have JWT auth, but treat them as high-risk.

## Deployment Checklist

- [ ] Use HTTPS everywhere
- [ ] `JWT_SECRET` is a strong random string (32+ chars)
- [ ] `FRONTEND_ORIGIN` is set correctly
- [ ] `DATABASE_URL` uses a managed PostgreSQL (not SQLite in prod)
- [ ] No `.env` file committed to Git
- [ ] Logging doesn't include passwords/tokens/PII
- [ ] Rate limiting added (if expecting >100 users/day)
- [ ] Backups enabled on your database
- [ ] Error emails/alerts set up for backend crashes

## Maintenance

- **Weekly:** Check backend logs for errors
- **Monthly:** Review user list for suspicious accounts
- **Quarterly:** Update dependencies (`pip list --outdated`, `npm outdated`)
- **As needed:** Rotate API keys if compromised

---

For deeper security hardening (OAuth2 compliance, GDPR/privacy policies, penetration testing), consult with a security professional before handling real user data at scale.
