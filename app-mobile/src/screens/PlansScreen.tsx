import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export default function PlansScreen({ navigation }: any) {
  const handleSelect = (planName: string) => {
    Alert.alert(
      'Subscribe',
      `You selected the ${planName} plan. Please use our web application at booktutor.com/upgrade to complete payment secure checkout.`,
      [{ text: 'OK' }]
    );
  };

  const freeFeatures = [
    '1 active book limit',
    'Daily summaries',
    'Standard roadmap',
    'Email notifications',
  ];

  const proFeatures = [
    'Unlimited book uploads',
    'AI-generated insights',
    'Spaced repetition flashcards',
    'WhatsApp & Telegram BOT',
    'Google Drive sync',
  ];

  const teamFeatures = [
    'Everything in Pro plan',
    'Up to 10 team seats',
    'Workspace dashboard',
    'Shared roadmap templates',
    'Dedicated support manager',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Subscription Plans</Text>
      <Text style={styles.subtitle}>Unlock reading summaries and bot deliveries</Text>

      {/* Plan Card: Free */}
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BASIC</Text>
        </View>
        <Text style={styles.planName}>Free Plan</Text>
        <Text style={styles.planPrice}>₹0 <Text style={styles.planPeriod}>/ forever</Text></Text>
        
        <View style={styles.features}>
          {freeFeatures.map((f, i) => (
            <Text key={i} style={styles.featureItem}>✓  {f}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.btnSecondary} disabled>
          <Text style={styles.btnSecondaryText}>Current Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Plan Card: Pro (Highlighted) */}
      <View style={[styles.card, styles.cardPro]}>
        <View style={styles.proLabelRow}>
          <View style={[styles.badge, styles.badgePro]}>
            <Text style={styles.badgeTextPro}>PRO</Text>
          </View>
          <Text style={styles.popText}>★ Most Popular</Text>
        </View>
        <Text style={styles.planName}>Premium Pro</Text>
        <Text style={styles.planPrice}>₹199 <Text style={styles.planPeriod}>/ month</Text></Text>

        <View style={styles.features}>
          {proFeatures.map((f, i) => (
            <Text key={i} style={styles.featureItem}>✓  {f}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={() => handleSelect('Pro')}>
          <Text style={styles.btnPrimaryText}>Upgrade Pro</Text>
        </TouchableOpacity>
      </View>

      {/* Plan Card: Team */}
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ORGANIZATION</Text>
        </View>
        <Text style={styles.planName}>Team Plan</Text>
        <Text style={styles.planPrice}>₹1,899 <Text style={styles.planPeriod}>/ year</Text></Text>

        <View style={styles.features}>
          {teamFeatures.map((f, i) => (
            <Text key={i} style={styles.featureItem}>✓  {f}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => handleSelect('Team')}>
          <Text style={styles.btnSecondaryText}>Upgrade Team</Text>
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
    gap: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.subtext,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardPro: {
    borderColor: colors.primary,
    borderWidth: 2.5,
  },
  proLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentDark,
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgePro: {
    backgroundColor: colors.primarySurface,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.subtext,
  },
  badgeTextPro: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.subtext,
  },
  features: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  featureItem: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadows.primary,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: colors.gray100,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  btnSecondaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
