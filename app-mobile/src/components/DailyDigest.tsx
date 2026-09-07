import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../lib/api';
import { colors, spacing, radius } from '../lib/theme';

interface Insight {
  id: string;
  text: string;
  type: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  concept: { bg: '#dbeafe', text: '#1e40af' },
  example: { bg: '#dcfce7', text: '#166534' },
  quote: { bg: '#f3e8ff', text: '#6b21a8' },
  framework: { bg: '#fef3c7', text: '#92400e' },
};

export default function DailyDigest() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dailyToday()
      .then((data) => setInsights(data.insights || []))
      .catch((err) => console.warn('Daily digest load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.brand600} />
      </View>
    );
  }

  if (insights.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No insights for today. Upload a book to get started!</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Lesson</Text>
        <Text style={styles.count}>{insights.length} insights</Text>
      </View>
      {insights.map((insight, idx) => {
        const isOpen = !!expanded[insight.id];
        const badge = TYPE_COLORS[insight.type] || TYPE_COLORS.concept;
        return (
          <TouchableOpacity
            key={insight.id}
            style={styles.card}
            onPress={() => setExpanded((e) => ({ ...e, [insight.id]: !e[insight.id] }))}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardIndex}>{idx + 1} of {insights.length}</Text>
                <Text style={styles.cardText} numberOfLines={isOpen ? undefined : 2}>
                  {insight.text}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{insight.type}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: colors.gray200,
  },
  emptyText: { color: colors.gray600, textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.gray900 },
  count: { fontSize: 12, color: colors.gray500, fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray200,
  },
  cardTop: { flexDirection: 'row', gap: spacing.sm },
  cardIndex: { fontSize: 12, color: colors.gray500, marginBottom: 2 },
  cardText: { fontSize: 15, fontWeight: '500', color: colors.gray900 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
