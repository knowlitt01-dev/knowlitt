import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Switch
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

interface MenuItem {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  isToggle?: boolean;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  route?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [booksCount, setBooksCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Settings toggles state
  const [dailyReminders, setDailyReminders] = useState(true);
  const [highRetentionSM2, setHighRetentionSM2] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

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

  const initial = (user?.email?.[0] || 'A').toUpperCase();
  const username = user?.email ? user.email.split('@')[0] : 'alex_scholar';

  const achievements = [
    { emoji: '⚡', name: 'Speed Reader', level: 'Lvl 3', bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B' },
    { emoji: '🧠', name: 'Memory Master', level: 'Lvl 5', bg: 'rgba(124, 58, 237, 0.15)', border: '#7C3AED' },
    { emoji: '🔥', name: 'Streak Legend', level: '7 Days', bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444' },
    { emoji: '📚', name: 'Bookworm', level: '8 Books', bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981' },
  ];

  const menuSections: MenuSection[] = [
    {
      title: 'LEARNING PREFERENCES',
      items: [
        {
          id: 'sm2',
          emoji: '🎯',
          label: 'SM-2 High Retention (90%)',
          desc: 'Shorter interval spacing for maximum memory recall',
          isToggle: true,
          value: highRetentionSM2,
          onToggle: setHighRetentionSM2
        },
        {
          id: 'reminders',
          emoji: '🔔',
          label: 'Daily Study Reminders',
          desc: 'Smart notifications at 8:00 PM peak focus time',
          isToggle: true,
          value: dailyReminders,
          onToggle: setDailyReminders
        },
        {
          id: 'sync',
          emoji: '🔄',
          label: 'Kindle & Drive Auto-Sync',
          desc: 'Automatically pull highlights & annotations',
          isToggle: true,
          value: autoSync,
          onToggle: setAutoSync
        },
      ]
    },
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        { id: 'acc', emoji: '👤', label: 'Account Details & Password', desc: 'Email, password & 2FA security', route: 'Settings' },
        { id: 'apps', emoji: '🔌', label: 'Connected Integrations', desc: 'Google Drive, Telegram bot & Notion', route: 'Connectors' },
        { id: 'billing', emoji: '💳', label: 'Subscription & Invoices', desc: 'Pro Scholar annual plan details', route: 'Plans' },
        { id: 'help', emoji: '💬', label: 'Help & Developer Support', desc: 'FAQs, feedback & priority support', route: 'Settings' },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Title */}
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Scholar Profile</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* User Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.avatarGlowContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>LVL 8</Text>
          </View>
        </View>

        <View style={styles.heroMeta}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.userEmailText}>{user?.email || 'scholar@booktutor.ai'}</Text>
          <Text style={styles.memberSince}>Member since Oct 2024 • 84% Memory Score</Text>
        </View>
      </View>

      {/* Pro Membership Banner */}
      <TouchableOpacity style={styles.proBanner}>
        <View style={styles.proBannerGlow} />
        <View style={styles.proBannerContent}>
          <View style={styles.proBannerLeft}>
            <View style={styles.proIconBox}>
              <Text style={styles.proIcon}>✨</Text>
            </View>
            <View>
              <Text style={styles.proBannerTitle}>Pro Scholar Active</Text>
              <Text style={styles.proBannerSub}>Unlimited AI Decks • Priority OCR • SM-2 Cloud Sync</Text>
            </View>
          </View>
          <View style={styles.proBannerPill}>
            <Text style={styles.proBannerPillText}>Manage</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Stats Summary Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📖</Text>
          <Text style={styles.statNumber}>{booksCount || 8}</Text>
          <Text style={styles.statLabel}>Books Active</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statNumber}>7 Days</Text>
          <Text style={styles.statLabel}>Study Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🧠</Text>
          <Text style={styles.statNumber}>{dueCount || 142}</Text>
          <Text style={styles.statLabel}>Cards Learned</Text>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ACHIEVEMENTS & BADGES</Text>
        <Text style={styles.sectionBadgeCount}>4/12 Unlocked</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsRow}>
        {achievements.map((ach, idx) => (
          <View key={idx} style={[styles.achieveCard, { borderColor: ach.border, backgroundColor: ach.bg }]}>
            <Text style={styles.achieveEmoji}>{ach.emoji}</Text>
            <Text style={styles.achieveName}>{ach.name}</Text>
            <Text style={styles.achieveLevel}>{ach.level}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Menu & Preferences Sections */}
      {menuSections.map((section, secIdx) => (
        <View key={secIdx} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, itemIdx) => (
              <View 
                key={item.id} 
                style={[
                  styles.menuRow,
                  itemIdx < section.items.length - 1 && styles.menuRowBorder
                ]}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconContainer}>
                    <Text style={styles.menuIcon}>{item.emoji}</Text>
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                    <Text style={styles.menuItemDesc}>{item.desc}</Text>
                  </View>
                </View>

                {item.isToggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#374151', true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  <TouchableOpacity 
                    onPress={() => item.route && navigation.navigate(item.route)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.menuChevron}>chevron_right</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Log Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Sign Out of BookTutor</Text>
      </TouchableOpacity>

      {/* App Version Info */}
      <Text style={styles.versionText}>BookTutor AI Mobile v2.4.0 • Nocturne Engine</Text>
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
    paddingBottom: spacing.xl2 * 2.5,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  editBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: '600',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl2,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  avatarGlowContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    backgroundColor: '#6366F1', // indigo ring
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  proBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  userEmailText: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  proBanner: {
    position: 'relative',
    backgroundColor: 'rgba(30, 27, 75, 0.7)',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  proBannerGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm2,
    flex: 1,
  },
  proIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proIcon: {
    fontSize: 16,
  },
  proBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E0E7FF',
  },
  proBannerSub: {
    fontSize: 10,
    color: '#A5B4FC',
    marginTop: 2,
  },
  proBannerPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  proBannerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  statEmoji: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.subtext,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.subtext,
    letterSpacing: 1,
  },
  sectionBadgeCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  achievementsRow: {
    marginBottom: spacing.xl,
    flexDirection: 'row',
  },
  achieveCard: {
    width: 100,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  achieveEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  achieveName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  achieveLevel: {
    fontSize: 9,
    color: colors.subtext,
    marginTop: 2,
    fontWeight: '600',
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.subtext,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  menuCard: {
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
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm2,
    flex: 1,
    paddingRight: spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  menuItemDesc: {
    fontSize: 10,
    color: colors.subtext,
    marginTop: 2,
  },
  menuChevron: {
    fontFamily: 'Material Icons',
    fontSize: 18,
    color: colors.subtext,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  versionText: {
    fontSize: 10,
    color: '#4B5563',
    textAlign: 'center',
  },
});

