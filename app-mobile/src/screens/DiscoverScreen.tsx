import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput
} from 'react-native';

export default function DiscoverScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Bestsellers');

  const categories = [
    '🔥 Bestsellers', '⚡ Productivity', '🧠 Psychology', '💼 Business', '🏛️ Philosophy', '🔬 Science & Tech'
  ];

  const trendingDecks = [
    {
      id: 'd1',
      title: 'Atomic Habits',
      author: 'James Clear',
      tags: ['Behavioral Psych', '24 Concepts'],
      rating: '4.9 ★ (3.4k)',
      color: '#1E1B4B',
      emoji: '🧠',
    },
    {
      id: 'd2',
      title: 'Deep Work',
      author: 'Cal Newport',
      tags: ['Flow State', '16 Concepts'],
      rating: '4.8 ★ (2.1k)',
      color: '#172554',
      emoji: '💡',
    },
    {
      id: 'd3',
      title: 'Psychology of Money',
      author: 'Morgan Housel',
      tags: ['Mindset', '20 Concepts'],
      rating: '4.9 ★ (2.9k)',
      color: '#064E3B',
      emoji: '💎',
    },
  ];

  const curatedLists = [
    {
      id: 'c1',
      title: 'Mental Models for Founders',
      authors: 'Ray Dalio, Peter Thiel, Charlie Munger',
      savedCount: '4.9k saved',
      count: '5 books stack',
    },
    {
      id: 'c2',
      title: 'Stoic Resilience in Chaos',
      authors: 'Marcus Aurelius, Seneca, Ryan Holiday',
      savedCount: '3.2k saved',
      count: '4 books stack',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Discover</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>✨ AI Curated</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search 10,000+ book summaries & AI decks..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
        <Text style={styles.micIcon}>🎙️</Text>
      </View>

      {/* Hero Card - AI Digest of the Week */}
      <TouchableOpacity style={styles.heroCard} activeOpacity={0.9}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>✨ AI DIGEST OF THE WEEK</Text>
          </View>
          <Text style={styles.readTime}>⏱ 14 min read</Text>
        </View>

        <Text style={styles.heroBookTitle}>Thinking, Fast and Slow</Text>
        <Text style={styles.heroBookAuthor}>by Daniel Kahneman</Text>

        <Text style={styles.heroDesc} numberOfLines={2}>
          Master System 1 & System 2 thinking, cognitive biases, and intuitive decision-making in 18 curated flashcards.
        </Text>

        <View style={styles.heroFooter}>
          <View style={styles.heroStats}>
            <Text style={styles.heroRating}>⭐ 4.9 (1.8k)</Text>
            <Text style={styles.heroDot}>·</Text>
            <Text style={styles.heroConcepts}>🧠 18 Concepts</Text>
          </View>

          <View style={styles.exploreBtn}>
            <Text style={styles.exploreBtnText}>Explore Summary ➔</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Categories Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Trending AI Decks Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Trending AI Decks</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.decksList}>
        {trendingDecks.map((deck) => (
          <View key={deck.id} style={styles.deckCard}>
            <View style={[styles.deckCover, { backgroundColor: deck.color }]}>
              <Text style={styles.deckEmoji}>{deck.emoji}</Text>
            </View>

            <View style={styles.deckInfo}>
              <Text style={styles.deckTitle}>{deck.title}</Text>
              <Text style={styles.deckAuthor}>{deck.author}</Text>

              <View style={styles.deckTagsRow}>
                {deck.tags.map((tag, idx) => (
                  <View key={idx} style={styles.deckTag}>
                    <Text style={styles.deckTagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.deckFooter}>
                <Text style={styles.deckRating}>{deck.rating}</Text>
                <TouchableOpacity style={styles.addLibBtn} activeOpacity={0.8}>
                  <Text style={styles.addLibBtnText}>+ Add to Library</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Community Curated Lists Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Community Curated Lists</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.curatedScroll}>
        {curatedLists.map((list) => (
          <TouchableOpacity key={list.id} style={styles.curatedCard} activeOpacity={0.85}>
            <View style={styles.curatedTop}>
              <Text style={styles.curatedBadgeText}>{list.count}</Text>
              <Text style={styles.curatedSaved}>{list.savedCount}</Text>
            </View>

            <Text style={styles.curatedTitle}>{list.title}</Text>
            <Text style={styles.curatedAuthors} numberOfLines={1}>{list.authors}</Text>
          </TouchableOpacity>
        ))}
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
  aiBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.25)',
  },
  aiBadgeText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
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
  },
  bellIcon: {
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
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  micIcon: {
    fontSize: 15,
    marginLeft: 8,
  },
  heroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuredBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  featuredBadgeText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '800',
  },
  readTime: {
    color: '#94A3B8',
    fontSize: 11,
  },
  heroBookTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  heroBookAuthor: {
    fontSize: 12,
    color: '#C4B5FD',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroRating: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  heroDot: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  heroConcepts: {
    color: '#DAE2FD',
    fontSize: 11,
  },
  exploreBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 8,
    marginBottom: 22,
  },
  categoryPill: {
    backgroundColor: '#171F33',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: '#C4B5FD',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#C4B5FD',
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DAE2FD',
    letterSpacing: -0.3,
  },
  seeAllText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  decksList: {
    gap: 14,
  },
  deckCard: {
    flexDirection: 'row',
    backgroundColor: '#171F33',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.15)',
    gap: 12,
    alignItems: 'center',
  },
  deckCover: {
    width: 56,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckEmoji: {
    fontSize: 28,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DAE2FD',
  },
  deckAuthor: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
    marginBottom: 6,
  },
  deckTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  deckTag: {
    backgroundColor: '#0B1326',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deckTagText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '600',
  },
  deckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckRating: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  addLibBtn: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
  },
  addLibBtnText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  curatedScroll: {
    gap: 12,
    paddingRight: 10,
  },
  curatedCard: {
    width: 200,
    backgroundColor: '#171F33',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  curatedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  curatedBadgeText: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  curatedSaved: {
    color: '#64748B',
    fontSize: 10,
  },
  curatedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DAE2FD',
    marginBottom: 4,
  },
  curatedAuthors: {
    fontSize: 11,
    color: '#94A3B8',
  },
});

