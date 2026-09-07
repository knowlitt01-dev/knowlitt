import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [booksCount, setBooksCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [books, due] = await Promise.all([api.listBooks(), api.dueCards()]);
        setBooksCount(books.length);
        setDueCount(due.length);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const initial = (user?.email?.[0] || 'U').toUpperCase();

  const menuItems = [
    { label: 'Account Settings', desc: 'Password & account details', emoji: '🔒', route: 'Settings' },
    { label: 'Notification Preferences', desc: 'WhatsApp & Telegram alerts', emoji: '🔔', route: 'Settings' },
    { label: 'Connected Apps', desc: 'Google Drive & Kindle integration', emoji: '🔌', route: 'Connectors' },
    { label: 'Subscription & Billing', desc: 'Razorpay monthly & annual plans', emoji: '💳', route: 'Plans' },
    { label: 'Location & Timezone', desc: 'Keep daily summaries accurate', emoji: '📍', route: 'Settings' },
    { label: 'Help & Support', desc: 'Send tickets to developers', emoji: '❓', route: 'Settings' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your learning settings</Text>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
          <Text style={styles.userId}>User: {user?.email?.split('@')[0]}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>📖</Text>
          <Text style={styles.statVal}>{booksCount}</Text>
          <Text style={styles.statLabel}>Books</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statVal}>7</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🗂️</Text>
          <Text style={styles.statVal}>{dueCount}</Text>
          <Text style={styles.statLabel}>Flashcards</Text>
        </View>
      </View>

      {/* Menu list */}
      <View style={styles.menuList}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.menuRow}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.menuEmojiContainer}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Log Out button */}
        <TouchableOpacity style={styles.logoutRow} onPress={logout}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuEmojiContainer, styles.logoutEmojiBg]}>
              <Text style={styles.logoutEmoji}>🚪</Text>
            </View>
            <View>
              <Text style={styles.logoutLabel}>Log Out</Text>
              <Text style={styles.logoutDesc}>Sign out of your account</Text>
            </View>
          </View>
          <Text style={styles.logoutArrow}>→</Text>
        </TouchableOpacity>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    maxWidth: 200,
  },
  userId: {
    fontSize: 11,
    color: colors.subtext,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  statIcon: {
    fontSize: 18,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.subtext,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  menuList: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm2,
  },
  menuEmojiContainer: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 16,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  menuDesc: {
    fontSize: 10,
    color: colors.subtext,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: '600',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  logoutEmojiBg: {
    backgroundColor: colors.errorBg,
  },
  logoutEmoji: {
    fontSize: 16,
  },
  logoutLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
  logoutDesc: {
    fontSize: 10,
    color: colors.error,
    opacity: 0.8,
    marginTop: 2,
  },
  logoutArrow: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
});
