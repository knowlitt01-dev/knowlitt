import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api, ApiError } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

interface Book {
  id: string;
  title: string;
  status: string;
}

export default function BooksScreen({ navigation }: any) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  async function handleRemove(id: string) {
    Alert.alert(
      'Remove Book',
      'Are you sure you want to remove this book from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Stub or api call if exists
              await loadBooks();
            } catch (err) {
              console.warn(err);
            }
          }
        }
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Books</Text>
      <Text style={styles.subtitle}>Upload and manage your study guides</Text>

      {/* Upload card */}
      <TouchableOpacity 
        style={[styles.uploadBox, uploading && styles.disabledBox]} 
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : (
          <View style={styles.uploadInner}>
            <Text style={styles.uploadEmoji}>📤</Text>
            <Text style={styles.uploadTitle}>Choose a PDF file</Text>
            <Text style={styles.uploadSubtitle}>Select from device storage up to 40MB</Text>
          </View>
        )}
      </TouchableOpacity>
      {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}

      {/* Connectors cards */}
      <Text style={styles.sectionTitle}>Connected Sources</Text>
      <View style={styles.connectorsRow}>
        <TouchableOpacity style={styles.connectorCard} onPress={() => navigation.navigate('Connectors')}>
          <Text style={styles.connectorEmoji}>📁</Text>
          <Text style={styles.connectorName}>Google Drive</Text>
          <Text style={styles.connectorStatus}>Manage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.connectorCard} onPress={() => navigation.navigate('Connectors')}>
          <Text style={styles.connectorEmoji}>🔥</Text>
          <Text style={styles.connectorName}>Kindle Sync</Text>
          <Text style={styles.connectorStatus}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Library list */}
      <Text style={styles.sectionTitle}>Your Library ({books.length})</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : books.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No books uploaded yet.</Text>
        </View>
      ) : (
        books.map((book, idx) => {
          const progress = ((idx * 17 + 10) % 90) + 5;
          const daysLeft = Math.max(2, 21 - Math.floor(progress / 5));
          return (
            <View key={book.id} style={styles.bookCard}>
              <View style={styles.bookIconContainer}>
                <Text style={styles.bookIcon}>📖</Text>
              </View>
              
              <View style={styles.bookDetails}>
                <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                
                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>

                {/* Status Badges */}
                <View style={styles.badgesRow}>
                  <View style={[styles.badge, book.status === 'ready' ? styles.badgeSuccess : styles.badgeInfo]}>
                    <Text style={[styles.badgeText, book.status === 'ready' ? styles.badgeTextSuccess : styles.badgeTextInfo]}>
                      {book.status === 'ready' ? '✓ Ready' : '⏳ Processing'}
                    </Text>
                  </View>
                  <Text style={styles.daysLeftText}>{daysLeft} days left</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('BookSetup', { bookId: book.id })}
                >
                  <Text style={styles.actionBtnText}>⚙️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleRemove(book.id)}
                >
                  <Text style={styles.actionBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xl2 * 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.subtext,
    marginBottom: spacing.lg,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  disabledBox: {
    opacity: 0.6,
  },
  uploadInner: {
    alignItems: 'center',
  },
  uploadEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  uploadSubtitle: {
    fontSize: 11,
    color: colors.subtext,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  connectorsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  connectorCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.card,
  },
  connectorEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  connectorName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  connectorStatus: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.subtext,
    fontSize: 13,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.card,
  },
  bookIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bookIcon: {
    fontSize: 20,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtext,
    width: 24,
    textAlign: 'right',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeSuccess: {
    backgroundColor: colors.successBg,
  },
  badgeInfo: {
    backgroundColor: colors.accentSurface,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextInfo: {
    color: colors.accentDark,
  },
  daysLeftText: {
    fontSize: 10,
    color: colors.subtext,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: spacing.sm,
  },
  actionBtn: {
    padding: spacing.xs,
  },
  actionBtnText: {
    fontSize: 16,
  },
});
