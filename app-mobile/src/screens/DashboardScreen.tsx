import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';
import DailyDigest from '../components/DailyDigest';

interface Book {
  id: string;
  title: string;
  status: string;
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [digestRefreshKey, setDigestRefreshKey] = useState(0);

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
    setDigestRefreshKey((k) => k + 1);
    await loadAll();
    setRefreshing(false);
  }

  const firstName = user?.email?.split('@')[0] || 'Reader';
  const activeBook = books.find(b => b.status === 'ready' || b.status === 'processing') || books[0];

  const quickActions = [
    { label: 'Upload Book', icon: '📤', route: 'Books' },
    { label: 'Connect Drive', icon: '🔌', route: 'Connectors' },
    { label: 'Flashcards', icon: '🗂️', route: 'Review' },
    { label: 'Roadmap', icon: '🗺️', route: 'Roadmap' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
    >
      {/* Greeting Header & Streak Counter */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.userName}>{firstName} 👋</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>7</Text>
          <Text style={styles.streakSub}>days</Text>
        </View>
      </View>

      {/* Daily Digest */}
      <DailyDigest key={digestRefreshKey} />

      {/* Due Flashcards Callout */}
      {dueCount > 0 && (
        <TouchableOpacity style={styles.reviewCta} onPress={() => navigation.navigate('Review')}>
          <View style={styles.reviewCtaLeft}>
            <Text style={styles.reviewCtaEmoji}>📚</Text>
            <View>
              <Text style={styles.reviewCtaTitle}>Review {dueCount} due card{dueCount !== 1 ? 's' : ''}</Text>
              <Text style={styles.reviewCtaDesc}>Maintain your reading retention streak</Text>
            </View>
          </View>
          <Text style={styles.reviewArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Today's Reading Hero Card */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Today's Reading</Text>
      </View>
      {activeBook ? (
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>READING NOW</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={1}>{activeBook.title}</Text>
            <Text style={styles.heroSubtitle}>Chapter 3 · Est. 12 mins left</Text>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroPoints}>⭐ +24 pts today</Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => navigation.navigate('Roadmap', { bookId: activeBook.id })}
            >
              <Text style={styles.heroButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyHeroCard}>
          <Text style={styles.emptyHeroText}>No books uploaded yet.</Text>
          <TouchableOpacity 
            style={styles.emptyHeroBtn}
            onPress={() => navigation.navigate('Books')}
          >
            <Text style={styles.emptyHeroBtnText}>Upload a Book</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Continue Reading shelf */}
      {books.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Books')}>
              <Text style={styles.viewAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfScroll}>
            {books.map((book, idx) => {
              const progress = ((idx * 17 + 10) % 90) + 5;
              return (
                <TouchableOpacity 
                  key={book.id}
                  style={styles.shelfCard}
                  onPress={() => navigation.navigate('Roadmap', { bookId: book.id })}
                >
                  <View style={styles.shelfBookIconContainer}>
                    <Text style={styles.shelfBookIcon}>📘</Text>
                  </View>
                  <Text style={styles.shelfBookTitle} numberOfLines={2}>{book.title}</Text>
                  <View style={styles.shelfProgressContainer}>
                    <View style={styles.shelfProgressBar}>
                      <View style={[styles.shelfProgressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.shelfProgressText}>{progress}% done</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Quick Actions Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.gridCard}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={styles.gridCardIconContainer}>
                <Text style={styles.gridCardIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.gridCardLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontSize: 14,
    color: colors.subtext,
    fontFamily: typography.fontFamily,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: typography.fontFamily,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSurface,
    borderWidth: 1,
    borderColor: colors.accentLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentDark,
    marginRight: 2,
  },
  streakSub: {
    fontSize: 10,
    color: colors.accentDark,
    fontWeight: '500',
  },
  reviewCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md2,
    marginVertical: spacing.md,
    ...shadows.primary,
  },
  reviewCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewCtaEmoji: {
    fontSize: 20,
  },
  reviewCtaTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewCtaDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  reviewArrow: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.primary,
  },
  heroTop: {
    marginBottom: spacing.lg,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  heroPoints: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  heroButton: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  heroButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyHeroCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    padding: spacing.xl2,
    alignItems: 'center',
  },
  emptyHeroText: {
    color: colors.subtext,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  emptyHeroBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  emptyHeroBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  shelfScroll: {
    paddingLeft: spacing.xs,
    paddingBottom: spacing.sm,
  },
  shelfCard: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.sm2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shelfBookIconContainer: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  shelfBookIcon: {
    fontSize: 28,
  },
  shelfBookTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    height: 32,
    lineHeight: 16,
  },
  shelfProgressContainer: {
    marginTop: spacing.xs,
  },
  shelfProgressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  shelfProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  shelfProgressText: {
    fontSize: 9,
    color: colors.subtext,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.md2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  gridCardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  gridCardIcon: {
    fontSize: 16,
  },
  gridCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
