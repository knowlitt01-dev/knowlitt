import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

interface Book {
  id: string;
  title: string;
  status: string;
  genre?: string | null;
  sub_genre?: string | null;
  content_mode?: 'extraction' | 'companion' | null;
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [bookList, due] = await Promise.all([api.listBooks(), api.dueCards()]);
      setBooks(bookList);
      setDueCount(due.length);
    } catch (err) {
      console.warn('Dashboard load failed:', err);
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  const firstName = user?.email?.split('@')[0] || 'Alex';
  const activeBook = books.find(b => b.status === 'ready' || b.status === 'processing') || books[0];
  const isCompanionMode = activeBook?.content_mode === 'companion';

  const sectionHeading = isCompanionMode ? "Today's Reading Assignment" : "Today's Key Points";
  const taglineCopy = isCompanionMode
    ? "Never lose your place — you do the reading, we handle the pacing."
    : "Absorb every idea in this book, a little each day.";
  const deckTitleCopy = isCompanionMode
    ? "Today: Read Ch. 4-5 (18 min)"
    : "Chapter 4: The 1st Law (Make it Obvious)";
  const deckDescCopy = isCompanionMode
    ? "Last time: Emma realized Mr. Knightley's hidden motives. Context ready for upcoming chapters."
    : "Review key cues, implementation intentions, and habit stacking anchors.";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#C4B5FD" colors={['#4F46E5']} />}
    >
      {/* Top App Bar & Greeting Header */}
      <View style={styles.topHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName[0]?.toUpperCase() || 'A'}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.greetingText}>Good morning,</Text>
            <Text style={styles.userName}>{firstName} 👋</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>5</Text>
            <Text style={styles.streakSub}>Days</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Tagline Banner */}
      <View style={styles.taglineBanner}>
        <Text style={styles.taglineText}>"{taglineCopy}"</Text>
      </View>

      {/* Overview Quick Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{books.length || 4}</Text>
            <Text style={styles.statLbl}>Books Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>182</Text>
            <Text style={styles.statLbl}>Cards Mastered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>78%</Text>
            <Text style={styles.statLbl}>Daily Goal</Text>
          </View>
        </View>

        {/* Daily Goal Bar */}
        <View style={styles.goalTrackContainer}>
          <View style={styles.goalTrackHeader}>
            <Text style={styles.goalTrackTitle}>Daily Retention Goal</Text>
            <Text style={styles.goalTrackSub}>18 / 25 mins</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '78%' }]} />
          </View>
        </View>
      </View>

      {/* AI Quick Actions Bar */}
      <View style={styles.quickToolsStrip}>
        <TouchableOpacity style={styles.toolPill} onPress={() => navigation.navigate('Books')}>
          <Text style={styles.toolIcon}>✨</Text>
          <Text style={styles.toolText}>AI Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolPill} onPress={() => navigation.navigate('Review')}>
          <Text style={styles.toolIcon}>🗂️</Text>
          <Text style={styles.toolText}>{isCompanionMode ? 'Reflections' : 'Flashcards'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolPill} onPress={() => navigation.navigate('Discover')}>
          <Text style={styles.toolIcon}>🎯</Text>
          <Text style={styles.toolText}>Quiz Me</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Flashcard / Reading Assignment Deck Section */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{sectionHeading}</Text>
          <View style={[styles.badgePill, isCompanionMode && { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }]}>
            <Text style={[styles.badgePillText, isCompanionMode && { color: '#F59E0B' }]}>
              {isCompanionMode ? '📖 Companion' : '🧠 Spaced Repetition'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deckCard}
        onPress={() => navigation.navigate('Review')}
        activeOpacity={0.9}
      >
        <View style={styles.deckTopRow}>
          <View style={styles.bookTag}>
            <Text style={styles.bookTagIcon}>{isCompanionMode ? '📚' : '📘'}</Text>
            <Text style={styles.bookTagText}>{activeBook?.title || 'Atomic Habits'}</Text>
          </View>
          <Text style={styles.dueBadge}>{dueCount > 0 ? `${dueCount} due` : isCompanionMode ? 'Session Ready' : '12 due today'}</Text>
        </View>

        <Text style={styles.deckChapterTitle}>{deckTitleCopy}</Text>
        <Text style={styles.deckChapterDesc}>{deckDescCopy}</Text>

        <View style={styles.deckBottomRow}>
          <View style={styles.retentionPill}>
            <Text style={styles.retentionIcon}>{isCompanionMode ? '📖' : '⚡'}</Text>
            <Text style={styles.retentionText}>{isCompanionMode ? 'Spoiler-Free Pacing' : 'High Retention Mode'}</Text>
          </View>

          <View style={styles.reviewBtn}>
            <Text style={styles.reviewBtnText}>{isCompanionMode ? 'Start Reading ➔' : 'Review Now ➔'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* My Library Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>My Library</Text>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => navigation.navigate('Books')}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadBtnIcon}>+</Text>
          <Text style={styles.uploadBtnText}>Upload Book</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.libraryScroll}>
        <TouchableOpacity style={styles.bookCard} onPress={() => navigation.navigate('Books')}>
          <View style={styles.bookCover}>
            <Text style={styles.bookCoverEmoji}>🧠</Text>
            <View style={styles.progressChip}>
              <Text style={styles.progressChipText}>68%</Text>
            </View>
          </View>
          <Text style={styles.bookTitle} numberOfLines={1}>Atomic Habits</Text>
          <Text style={styles.bookAuthor}>James Clear</Text>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterBadgeText}>Ch 4 of 10 · Active</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookCard} onPress={() => navigation.navigate('Books')}>
          <View style={[styles.bookCover, { backgroundColor: '#1E1B4B' }]}>
            <Text style={styles.bookCoverEmoji}>💡</Text>
            <View style={styles.progressChip}>
              <Text style={styles.progressChipText}>42%</Text>
            </View>
          </View>
          <Text style={styles.bookTitle} numberOfLines={1}>Deep Work</Text>
          <Text style={styles.bookAuthor}>Cal Newport</Text>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterBadgeText}>Ch 2 of 7 · Summary</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookCard} onPress={() => navigation.navigate('Books')}>
          <View style={[styles.bookCover, { backgroundColor: '#172554' }]}>
            <Text style={styles.bookCoverEmoji}>📊</Text>
            <View style={styles.progressChip}>
              <Text style={styles.progressChipText}>15%</Text>
            </View>
          </View>
          <Text style={styles.bookTitle} numberOfLines={1}>Thinking, Fast</Text>
          <Text style={styles.bookAuthor}>D. Kahneman</Text>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterBadgeText}>Ch 1 of 12</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

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
  taglineBanner: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  taglineText: {
    color: '#C4B5FD',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '500',
    textAlign: 'center',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarGlow: {
    padding: 2,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#171F33',
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#DAE2FD',
    fontWeight: '800',
    fontSize: 18,
  },
  greetingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DAE2FD',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakCount: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 13,
  },
  streakSub: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#171F33',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 16,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statsCard: {
    backgroundColor: '#171F33',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.15)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#DAE2FD',
  },
  statLbl: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalTrackContainer: {
    backgroundColor: '#0B1326',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  goalTrackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTrackTitle: {
    color: '#DAE2FD',
    fontSize: 12,
    fontWeight: '600',
  },
  goalTrackSub: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  quickToolsStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  toolPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171F33',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  toolIcon: {
    fontSize: 14,
  },
  toolText: {
    color: '#DAE2FD',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DAE2FD',
    letterSpacing: -0.3,
  },
  badgePill: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
  },
  badgePillText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  deckCard: {
    backgroundColor: '#171F33',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  deckTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1326',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  bookTagIcon: {
    fontSize: 12,
  },
  bookTagText: {
    color: '#DAE2FD',
    fontSize: 12,
    fontWeight: '600',
  },
  dueBadge: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  deckChapterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  deckChapterDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  deckBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
  },
  retentionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retentionIcon: {
    fontSize: 12,
  },
  retentionText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  reviewBtnArrow: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.25)',
    gap: 4,
  },
  uploadBtnIcon: {
    color: '#C4B5FD',
    fontSize: 14,
    fontWeight: '800',
  },
  uploadBtnText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  libraryScroll: {
    gap: 12,
    paddingRight: 10,
  },
  bookCard: {
    width: 140,
    backgroundColor: '#171F33',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bookCover: {
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  bookCoverEmoji: {
    fontSize: 32,
  },
  progressChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(11, 19, 38, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.3)',
  },
  progressChipText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '800',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DAE2FD',
  },
  bookAuthor: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  chapterBadge: {
    backgroundColor: '#0B1326',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chapterBadgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
});

