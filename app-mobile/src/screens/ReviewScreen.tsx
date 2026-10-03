import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { api } from '../lib/api';

interface DueCard {
  card_id: string;
  front: string;
  back: string;
  card_type?: string;
  content_mode?: 'extraction' | 'companion';
  book_title?: string;
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

  async function handleResponse(response: 'again' | 'hard' | 'good' | 'easy') {
    const card = cards[current];
    setSubmitting(true);
    try {
      const apiRating = response === 'again' ? 'again' : 'good';
      await api.submitReview(card.card_id, apiRating);
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
        <ActivityIndicator color="#C4B5FD" size="large" />
        <Text style={styles.loadingText}>Loading your spaced repetition deck...</Text>
      </View>
    );
  }

  if ((cards.length === 0 && !done) || done) {
    return (
      <View style={styles.centered}>
        <View style={styles.trophyContainer}>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </View>
        <Text style={styles.doneTitle}>{done ? 'Session Completed!' : 'All Caught Up!'}</Text>
        <Text style={styles.doneSubtitle}>
          {done ? `Awesome job! You reviewed ${cards.length} cards today.` : 'No cards due for review right now. Great work!'}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('HomeTab')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Return to Dashboard ➔</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = cards[current];
  const total = cards.length || 12;
  const progressPercent = ((current + 1) / total) * 100;

  const isCompanion = card.content_mode === 'companion' || card.card_type === 'reflection';
  const categoryLabel = isCompanion ? '💬 Reflection Prompt' : '✦ Concept Ingestion';
  const stateLabel = flipped
    ? (isCompanion ? 'REFLECTION' : 'ANSWER')
    : (isCompanion ? 'PROMPT' : 'QUESTION');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Top Session Bar */}
      <View style={styles.topSessionBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.sessionTimerBadge}>
          <Text style={styles.timerText}>⏱ 04:21</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 5 Days</Text>
        </View>
      </View>

      {/* Progress Header */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Card {current + 1} of {total}</Text>
        <Text style={styles.progressPercentText}>{Math.round(progressPercent)}% Completed</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Context Badge */}
      <View style={styles.bookBadge}>
        <Text style={styles.bookBadgeIcon}>{isCompanion ? '📖' : '📘'}</Text>
        <Text style={styles.bookBadgeText}>{card.book_title || 'Active Reading Session'}</Text>
      </View>

      {/* Interactive 3D Card Container */}
      <TouchableOpacity
        style={[styles.flashcard, flipped && styles.flashcardFlipped]}
        onPress={() => setFlipped(!flipped)}
        activeOpacity={0.9}
        disabled={submitting}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryTag, isCompanion && { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <Text style={[styles.categoryTagText, isCompanion && { color: '#F59E0B' }]}>{categoryLabel}</Text>
          </View>
          <Text style={styles.cardStateLabel}>{stateLabel}</Text>
        </View>

        {!flipped ? (
          <View style={styles.frontContent}>
            <Text style={styles.frontQuestion}>
              {card.front}
            </Text>

            <View style={styles.flipPrompt}>
              <Text style={styles.flipPromptText}>
                {isCompanion ? 'Tap to reveal reflection insights 🔄' : 'Tap card to reveal answer 🔄'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.backContent}>
            <Text style={styles.answerHeadline}>
              {card.back}
            </Text>

            <View style={styles.aiInsightBox}>
              <Text style={styles.aiInsightTitle}>
                {isCompanion ? '📖 Character & Narrative Context' : '💡 AI Deep Dive Insight'}
              </Text>
              <Text style={styles.aiInsightText}>
                {isCompanion
                  ? 'Reflecting on character motives and thematic beats strengthens emotional connection to the story without revealing future plot points.'
                  : 'Active recall and spaced repetition strengthen long-term memory traces in cortical neural networks.'}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* SM-2 Spaced Repetition Rating Action Bar */}
      {flipped ? (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate Recall Difficulty (SM-2 Algorithm)</Text>
          <View style={styles.sm2Grid}>
            
            <TouchableOpacity
              style={[styles.sm2Button, styles.sm2Again]}
              onPress={() => handleResponse('again')}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.sm2Icon}>🔴</Text>
              <Text style={styles.sm2Label}>Again</Text>
              <Text style={styles.sm2Sub}>&lt; 1d</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sm2Button, styles.sm2Hard]}
              onPress={() => handleResponse('hard')}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.sm2Icon}>🟡</Text>
              <Text style={styles.sm2Label}>Hard</Text>
              <Text style={styles.sm2Sub}>3d</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sm2Button, styles.sm2Good]}
              onPress={() => handleResponse('good')}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.sm2Icon}>🟢</Text>
              <Text style={styles.sm2Label}>Good</Text>
              <Text style={styles.sm2Sub}>6d</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sm2Button, styles.sm2Easy]}
              onPress={() => handleResponse('easy')}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.sm2Icon}>🟣</Text>
              <Text style={styles.sm2Label}>Easy</Text>
              <Text style={styles.sm2Sub}>12d</Text>
            </TouchableOpacity>

          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.revealButton}
          onPress={() => setFlipped(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.revealButtonText}>View Answer & Rate Recall ➔</Text>
        </TouchableOpacity>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0B1326',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#171F33',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  trophyEmoji: {
    fontSize: 40,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DAE2FD',
    marginBottom: 6,
  },
  doneSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  topSessionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#171F33',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#DAE2FD',
    fontSize: 18,
  },
  sessionTimerBadge: {
    backgroundColor: '#171F33',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
  },
  timerText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  streakBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DAE2FD',
  },
  progressPercentText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  bookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171F33',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    gap: 8,
  },
  bookBadgeIcon: {
    fontSize: 14,
  },
  bookBadgeText: {
    color: '#DAE2FD',
    fontSize: 12,
    fontWeight: '600',
  },
  flashcard: {
    backgroundColor: '#171F33',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(196, 181, 253, 0.2)',
    minHeight: 280,
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  flashcardFlipped: {
    borderColor: 'rgba(124, 58, 237, 0.4)',
    backgroundColor: '#1E1B4B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  categoryTagText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  cardStateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  frontContent: {
    flex: 1,
    justifyContent: 'center',
  },
  frontQuestion: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 26,
    marginBottom: 14,
  },
  excerptBox: {
    backgroundColor: '#0B1326',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#C4B5FD',
    marginBottom: 16,
  },
  excerptText: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  flipPrompt: {
    alignItems: 'center',
    marginTop: 8,
  },
  flipPromptText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  backContent: {
    flex: 1,
  },
  answerHeadline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 12,
  },
  takeawayList: {
    gap: 8,
    marginBottom: 16,
  },
  takeawayItem: {
    color: '#DAE2FD',
    fontSize: 13,
    lineHeight: 19,
  },
  aiInsightBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
  },
  aiInsightTitle: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiInsightText: {
    color: '#DAE2FD',
    fontSize: 11,
    lineHeight: 16,
  },
  ratingSection: {
    marginTop: 4,
  },
  ratingTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  sm2Grid: {
    flexDirection: 'row',
    gap: 10,
  },
  sm2Button: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sm2Again: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  sm2Hard: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  sm2Good: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sm2Easy: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: 'rgba(196, 181, 253, 0.3)',
  },
  sm2Icon: {
    fontSize: 14,
    marginBottom: 2,
  },
  sm2Label: {
    color: '#DAE2FD',
    fontSize: 12,
    fontWeight: '700',
  },
  sm2Sub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  revealButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  revealButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

