import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator
} from 'react-native';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

interface Book {
  id: string;
  title: string;
  status: string;
}

interface RoadmapItem {
  id: string;
  days: string;
  chapter: string;
  title: string;
  state: 'done' | 'current' | 'upcoming';
  points: number;
}

export default function RoadmapScreen({ route, navigation }: any) {
  const { bookId } = route.params || {};

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const mockRoadmap: RoadmapItem[] = [
    { id: '1', days: 'Day 1–3', chapter: 'Chapter 1', title: 'Introduction & Foundations', state: 'done', points: 15 },
    { id: '2', days: 'Day 4–7', chapter: 'Chapter 2', title: 'Core Principles of Learning', state: 'done', points: 25 },
    { id: '3', days: 'Day 8–11', chapter: 'Chapter 3', title: 'Application & Methods', state: 'current', points: 20 },
    { id: '4', days: 'Day 12–15', chapter: 'Chapter 4', title: 'Advanced Synthesis', state: 'upcoming', points: 30 },
    { id: '5', days: 'Day 16–20', chapter: 'Chapter 5', title: 'Summary & Integration', state: 'upcoming', points: 20 },
  ];

  useEffect(() => {
    async function loadBooks() {
      try {
        const list = await api.listBooks();
        setBooks(list);
        if (list.length > 0) {
          setSelectedBookId(bookId || list[0].id);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [bookId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const activeBook = books.find(b => b.id === selectedBookId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Roadmap</Text>
      <Text style={styles.subtitle}>Your scheduled reading timeline</Text>

      {books.length > 0 ? (
        <View style={styles.roadmapWrapper}>
          {/* Active Book card brief */}
          {activeBook && (
            <View style={styles.bookBriefCard}>
              <Text style={styles.bookBriefLabel}>Roadmap For</Text>
              <Text style={styles.bookBriefTitle} numberOfLines={1}>{activeBook.title}</Text>
            </View>
          )}

          {/* Vertical Timeline container */}
          <View style={styles.timelineContainer}>
            {/* Connecting line */}
            <View style={styles.verticalLine} />

            {mockRoadmap.map((item, index) => {
              const isDone = item.state === 'done';
              const isCurrent = item.state === 'current';
              const isUpcoming = item.state === 'upcoming';

              return (
                <View key={item.id} style={styles.timelineRow}>
                  {/* Circle Indicator */}
                  <View style={styles.indicatorContainer}>
                    <View style={[
                      styles.circle,
                      isDone && styles.circleDone,
                      isCurrent && styles.circleCurrent,
                      isUpcoming && styles.circleUpcoming
                    ]}>
                      {isDone && <Text style={styles.circleText}>✓</Text>}
                      {isCurrent && <Text style={styles.circleText}>▶</Text>}
                      {isUpcoming && <Text style={styles.circleTextUpcoming}>○</Text>}
                    </View>
                  </View>

                  {/* Roadmap Item Card */}
                  <View style={[
                    styles.itemCard,
                    isCurrent && styles.itemCardCurrent
                  ]}>
                    <View style={styles.cardHeader}>
                      <View style={[
                        styles.daysBadge,
                        isDone && styles.badgeDone,
                        isCurrent && styles.badgeCurrent,
                        isUpcoming && styles.badgeUpcoming
                      ]}>
                        <Text style={[
                          styles.daysBadgeText,
                          isDone && styles.badgeTextDone,
                          isCurrent && styles.badgeTextCurrent,
                          isUpcoming && styles.badgeTextUpcoming
                        ]}>
                          {item.days}
                        </Text>
                      </View>
                      <Text style={styles.pointsText}>+{item.points} pts</Text>
                    </View>

                    <Text style={styles.itemChapter}>{item.chapter}</Text>
                    <Text style={styles.itemTitle}>{item.title}</Text>

                    {isCurrent && (
                      <TouchableOpacity 
                        style={styles.reviewBtn}
                        onPress={() => navigation.navigate('Review')}
                      >
                        <Text style={styles.reviewBtnText}>Active Study session</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active book schedules found.</Text>
        </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  roadmapWrapper: {
    marginTop: spacing.xs,
  },
  bookBriefCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookBriefLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  bookBriefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: spacing.xs,
  },
  verticalLine: {
    position: 'absolute',
    left: 21,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  indicatorContainer: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  circleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  circleCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleUpcoming: {
    backgroundColor: '#fff',
    borderColor: colors.subtext,
  },
  circleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  circleTextUpcoming: {
    color: colors.subtext,
    fontSize: 14,
    lineHeight: 16,
  },
  itemCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  itemCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xl,
  },
  badgeDone: {
    backgroundColor: colors.successBg,
  },
  badgeCurrent: {
    backgroundColor: 'rgba(74, 54, 222, 0.15)',
  },
  badgeUpcoming: {
    backgroundColor: colors.gray100,
  },
  daysBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  badgeTextDone: {
    color: colors.success,
  },
  badgeTextCurrent: {
    color: colors.primary,
  },
  badgeTextUpcoming: {
    color: colors.subtext,
  },
  pointsText: {
    fontSize: 11,
    color: colors.subtext,
    fontWeight: '600',
  },
  itemChapter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  itemTitle: {
    fontSize: 11,
    color: colors.subtext,
    marginTop: 2,
  },
  reviewBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  reviewBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
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
});
