import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

interface DueCard {
  card_id: string;
  front: string;
  back: string;
}

export default function ReviewScreen({ navigation }: any) {
  const [cards, setCards] = useState<DueCard[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.dueCards()
      .then(setCards)
      .catch((err) => console.warn('Failed to load due cards:', err))
      .finally(() => setLoading(false));
  }, []);

  async function handleResponse(response: 'again' | 'got_it') {
    const card = cards[current];
    setSubmitting(true);
    try {
      // Map 'got_it' to 'good' for API compatibility
      await api.submitReview(card.card_id, response === 'got_it' ? 'good' : 'again');
      if (current + 1 >= cards.length) {
        setDone(true);
      } else {
        setCurrent(current + 1);
        setFlipped(false);
      }
    } catch (err) {
      console.warn('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading your review session...</Text>
      </View>
    );
  }

  if ((cards.length === 0 && !done) || done) {
    return (
      <View style={styles.centered}>
        <Text style={styles.trophyEmoji}>🏆</Text>
        <Text style={styles.doneTitle}>{done ? 'Session Complete!' : 'All caught up!'}</Text>
        <Text style={styles.doneSubtitle}>
          {done ? `You reviewed ${cards.length} cards.` : 'No cards due for review right now.'}
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = cards[current];
  const progressPercent = cards.length > 0 ? (current / cards.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Card {current + 1} of {cards.length}</Text>
      
      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Card Body */}
      <TouchableOpacity
        style={[styles.flashcard, flipped ? styles.flashcardFlipped : styles.flashcardNormal]}
        onPress={() => setFlipped(!flipped)}
        activeOpacity={0.9}
        disabled={submitting}
      >
        <Text style={[styles.flashcardLabel, flipped ? styles.flashcardLabelFlipped : styles.flashcardLabelNormal]}>
          {flipped ? 'Answer' : 'Question'}
        </Text>
        <Text style={styles.flashcardText}>{flipped ? card.back : card.front}</Text>
        {!flipped && (
          <Text style={styles.tapTip}>Tap to flip</Text>
        )}
      </TouchableOpacity>

      {/* Bottom Actions */}
      {!flipped ? (
        <TouchableOpacity style={styles.showAnswerButton} onPress={() => setFlipped(true)}>
          <Text style={styles.showAnswerText}>Reveal Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.responseGrid}>
          <TouchableOpacity
            style={[styles.responseButton, { backgroundColor: colors.error }]}
            onPress={() => handleResponse('again')}
            disabled={submitting}
          >
            <Text style={styles.responseText}>Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.responseButton, { backgroundColor: colors.success }]}
            onPress={() => handleResponse('got_it')}
            disabled={submitting}
          >
            <Text style={styles.responseText}>Got it</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.subtext,
    marginTop: spacing.sm,
    fontSize: 13,
  },
  progress: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  flashcard: {
    height: 300,
    borderRadius: radius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.card,
  },
  flashcardNormal: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  flashcardFlipped: {
    backgroundColor: colors.successBg,
    borderColor: '#CDEFD6',
  },
  flashcardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    position: 'absolute',
    top: spacing.md,
  },
  flashcardLabelNormal: {
    color: colors.subtext,
  },
  flashcardLabelFlipped: {
    color: colors.success,
  },
  flashcardText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  tapTip: {
    fontSize: 10,
    color: colors.subtext,
    position: 'absolute',
    bottom: spacing.md,
    fontStyle: 'italic',
  },
  showAnswerButton: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    ...shadows.card,
  },
  showAnswerText: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 14,
  },
  responseGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  responseButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.primary,
  },
  responseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  trophyEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  doneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  doneSubtitle: {
    color: colors.subtext,
    fontSize: 13,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl2,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
