import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api, ApiError } from '../lib/api';

interface Book {
  id: string;
  title: string;
  author: string | null;
  status: string;
  genre: string | null;
  sub_genre: string | null;
  content_mode: 'extraction' | 'companion' | null;
  error_message: string | null;
}

export default function BooksScreen({ navigation }: any) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      const list = await api.listBooks();
      setBooks(list);
    } catch (err) {
      console.warn('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    setUploadError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setUploading(true);
      const res = await api.uploadBook(file.uri, file.name, file.mimeType || 'application/pdf');
      const failed = res.results?.filter((r: any) => r.status === 'failed');
      if (failed?.length > 0) {
        setUploadError(failed[0].error || 'Upload failed');
      }
      await loadBooks();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const filters = ['All', 'In Progress', 'AI Summarized', 'Completed', 'Favorites'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Library</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{books.length || 8} Books</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.searchToggle} activeOpacity={0.7}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <Text style={styles.inputSearchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search titles, authors, or topics..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Upload Action Banner */}
      <TouchableOpacity
        style={[styles.uploadBanner, uploading && styles.disabledBanner]}
        onPress={handleUpload}
        disabled={uploading}
        activeOpacity={0.85}
      >
        {uploading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <View style={styles.uploadBannerContent}>
            <View style={styles.uploadIconBadge}>
              <Text style={styles.uploadEmoji}>📤</Text>
            </View>
            <View style={styles.uploadTextCol}>
              <Text style={styles.uploadTitle}>+ Upload PDF / EPUB</Text>
              <Text style={styles.uploadSub}>Instant AI flashcards & chapter tutor</Text>
            </View>
            <Text style={styles.uploadArrow}>➔</Text>
          </View>
        )}
      </TouchableOpacity>
      {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}

      {/* Filter Chips Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter} {filter === 'All' ? `(${books.length || 8})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Stats Mini Strip */}
      <View style={styles.healthStrip}>
        <Text style={styles.healthItem}>⚡ <Text style={styles.healthHighlight}>4</Text> Active Tutors</Text>
        <Text style={styles.healthDot}>·</Text>
        <Text style={styles.healthItem}>📈 <Text style={styles.healthHighlight}>88%</Text> Retention</Text>
        <Text style={styles.healthDot}>·</Text>
        <Text style={styles.healthItem}>🗂️ <Text style={styles.healthHighlight}>142</Text> Due</Text>
      </View>

      {/* Book Cards Section */}
      <Text style={styles.sectionTitle}>All Books</Text>
      {loading ? (
        <ActivityIndicator color="#C4B5FD" style={{ marginTop: 20 }} />
      ) : books.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>No books yet</Text>
          <Text style={styles.emptyDesc}>Upload a PDF to get started with AI-powered reading.</Text>
        </View>
      ) : (
        <View style={styles.booksList}>
          {books.map((book) => {
            const isCompanion = book.content_mode === 'companion';
            const modeEmoji  = isCompanion ? '📖' : '🧠';
            const modeLabel  = isCompanion ? 'Companion' : 'Extraction';
            const modeColor  = isCompanion ? '#F59E0B' : '#6366F1';
            const modeBg     = isCompanion ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)';
            const modeBorder = isCompanion ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)';
            const coverEmoji = isCompanion ? '📚' : '🧠';
            const actionText = isCompanion ? 'Read ➔' : 'Review ➔';
            const subCopy    = isCompanion
              ? 'Reading companion active'
              : book.status === 'ready' ? 'Cards ready' : book.status;
            const isFailed = book.status === 'failed';

            return (
              <TouchableOpacity
                key={book.id}
                style={[styles.bookCard, isFailed && styles.bookCardFailed]}
                onPress={() => navigation.navigate('Books')}
                activeOpacity={0.85}
              >
                <View style={[styles.bookCover, { backgroundColor: isCompanion ? '#2D1B5E' : '#1E1B4B' }]}>
                  <Text style={styles.bookEmoji}>{coverEmoji}</Text>
                </View>
                <View style={styles.bookInfo}>
                  <View style={styles.bookHeaderRow}>
                    <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                    {/* Mode badge */}
                    {book.content_mode && (
                      <View style={[styles.modeBadge, { backgroundColor: modeBg, borderColor: modeBorder }]}>
                        <Text style={[styles.modeBadgeText, { color: modeColor }]}>
                          {modeEmoji} {modeLabel}
                        </Text>
                      </View>
                    )}
                  </View>

                  {book.author ? <Text style={styles.bookAuthor}>{book.author}</Text> : null}

                  {!isFailed && (
                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: book.status === 'ready' ? '100%' : '30%', backgroundColor: isCompanion ? '#F59E0B' : '#4F46E5' }]} />
                      </View>
                      <Text style={styles.progressText}>{book.status === 'ready' ? '100%' : '...'}</Text>
                    </View>
                  )}

                  <View style={styles.metaRow}>
                    {isFailed
                      ? <Text style={styles.errorChipText} numberOfLines={1}>{book.error_message || 'Processing failed'}</Text>
                      : <Text style={styles.chapterText}>{subCopy}</Text>
                    }
                    {!isFailed && book.status === 'ready' && (
                      <TouchableOpacity style={styles.actionPill}>
                        <Text style={styles.actionPillText}>{actionText}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1326', // Nocturne Luminary Dark Canvas
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#DAE2FD',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.25)',
  },
  countBadgeText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#171F33',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171F33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 18,
  },
  inputSearchIcon: {
    fontSize: 15,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  uploadBanner: {
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledBanner: {
    opacity: 0.7,
  },
  uploadBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadEmoji: {
    fontSize: 22,
  },
  uploadTextCol: {
    flex: 1,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  uploadSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  uploadArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#FFB4AB',
    fontSize: 12,
    marginBottom: 12,
  },
  filterScroll: {
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#171F33',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: '#C4B5FD',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#C4B5FD',
    fontWeight: '700',
  },
  healthStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171F33',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  healthItem: {
    color: '#94A3B8',
    fontSize: 11,
  },
  healthHighlight: {
    color: '#DAE2FD',
    fontWeight: '700',
  },
  healthDot: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DAE2FD',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  booksList: {
    gap: 14,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#171F33',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.15)',
    gap: 12,
    alignItems: 'center',
  },
  bookCover: {
    width: 56,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookEmoji: {
    fontSize: 28,
  },
  bookInfo: {
    flex: 1,
  },
  bookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DAE2FD',
    flex: 1,
  },
  retentionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  retentionText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  bookAuthor: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  progressText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterText: {
    fontSize: 11,
    color: '#64748B',
  },
  actionPill: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionPillText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
});

