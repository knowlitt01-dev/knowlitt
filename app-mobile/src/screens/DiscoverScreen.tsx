import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Switch
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export default function DiscoverScreen() {
  const [search, setSearch] = useState('');
  const [domainMode, setDomainMode] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('Tech & AI');

  const domainTags = [
    'Tech & AI', 'Business', 'History', 'Philosophy', 'Science', 'Self Help', 'Finance', 'Psychology'
  ];

  const trendingBooks = [
    { id: 't1', title: 'Atomic Habits', author: 'James Clear', reads: '14.2k reads', category: 'Self Help' },
    { id: 't2', title: 'Zero to One', author: 'Peter Thiel', reads: '9.8k reads', category: 'Business' },
    { id: 't3', title: 'Sapiens', author: 'Yuval Noah Harari', reads: '18.5k reads', category: 'History' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Search & Discover</Text>
      <Text style={styles.subtitle}>Explore topics or follow article streams</Text>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, authors, domains..."
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Domain Mode Switch Card */}
      <View style={styles.domainCard}>
        <View style={styles.domainHeader}>
          <View style={styles.domainHeaderLeft}>
            <Text style={styles.domainEmoji}>📻</Text>
            <View style={styles.domainHeaderText}>
              <Text style={styles.domainTitle}>No book right now?</Text>
              <Text style={styles.domainDesc}>Turn on domain notifications mode.</Text>
            </View>
          </View>
          <Switch
            value={domainMode}
            onValueChange={setDomainMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {domainMode && (
          <View style={styles.domainSelector}>
            <Text style={styles.domainSelectorLabel}>SELECT ACTIVE DOMAIN:</Text>
            <View style={styles.tagRow}>
              {domainTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, selectedDomain === tag ? styles.tagChipActive : {}]}
                  onPress={() => setSelectedDomain(tag)}
                >
                  <Text style={[styles.tagText, selectedDomain === tag ? styles.tagTextActive : {}]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Suggested Topic Tags */}
      <Text style={styles.sectionTitle}>Suggested topics</Text>
      <View style={styles.tagRow}>
        {domainTags.slice(0, 5).map(tag => (
          <TouchableOpacity 
            key={tag} 
            style={styles.tagChip}
            onPress={() => {
              setSearch(tag);
              setDomainMode(true);
              setSelectedDomain(tag);
            }}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trending Books */}
      <Text style={styles.sectionTitle}>Trending Books</Text>
      <View style={styles.trendingList}>
        {trendingBooks.map(book => (
          <View key={book.id} style={styles.trendingCard}>
            <View style={styles.trendingTextContainer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{book.category}</Text>
              </View>
              <Text style={styles.trendingTitle} numberOfLines={1}>{book.title}</Text>
              <Text style={styles.trendingAuthor}>{book.author}</Text>
            </View>
            <View style={styles.trendingRight}>
              <Text style={styles.readsCount}>{book.reads}</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Text style={styles.addBtnText}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  domainCard: {
    backgroundColor: colors.accentSurface,
    borderRadius: radius.lg,
    padding: spacing.md2,
    borderWidth: 1,
    borderColor: colors.accentLight,
    marginBottom: spacing.md,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  domainEmoji: {
    fontSize: 22,
  },
  domainHeaderText: {
    maxWidth: '70%',
  },
  domainTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  domainDesc: {
    fontSize: 10,
    color: colors.subtext,
    marginTop: 2,
    lineHeight: 14,
  },
  domainSelector: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(250, 158, 51, 0.2)',
    paddingTop: spacing.md,
  },
  domainSelectorLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.accentDark,
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  tagChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  tagText: {
    fontSize: 11,
    color: colors.subtext,
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  trendingList: {
    gap: spacing.sm,
  },
  trendingCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.card,
  },
  trendingTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '700',
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  trendingAuthor: {
    fontSize: 11,
    color: colors.subtext,
    marginTop: 2,
  },
  trendingRight: {
    alignItems: 'flex-end',
  },
  readsCount: {
    fontSize: 9,
    color: colors.subtext,
    marginBottom: 4,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
});
