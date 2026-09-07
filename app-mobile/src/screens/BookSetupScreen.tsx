import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export default function BookSetupScreen({ route, navigation }: any) {
  const { bookId } = route.params || {};

  const [bookTitle, setBookTitle] = useState('Book Study Plan');
  const [loading, setLoading] = useState(true);

  // Form state
  const [days, setDays] = useState<number>(14);
  const [customDays, setCustomDays] = useState('');
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [remindersCount, setRemindersCount] = useState<number>(2);
  const [sessionPace, setSessionPace] = useState<'chapter' | 'pages'>('chapter');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00', '18:00']);
  const [deliveryChannel, setDeliveryChannel] = useState<'app' | 'whatsapp' | 'telegram'>('app');
  const [saving, setSaving] = useState(false);

  const timeOptions = [
    '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '21:00', '22:00'
  ];

  useEffect(() => {
    async function loadBookTitle() {
      try {
        const books = await api.listBooks();
        const found = books.find((b: any) => b.id === bookId);
        if (found) setBookTitle(found.title);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    if (bookId) loadBookTitle();
    else setLoading(false);
  }, [bookId]);

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalDays = isCustomDays ? parseInt(customDays) || 14 : days;
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 600));
      Alert.alert('Plan Activated', 'Your customized daily learning roadmap has been successfully activated!');
      navigation.goBack();
    } catch (err) {
      console.warn(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Plan Setup</Text>
      <Text style={styles.bookTitle} numberOfLines={1}>{bookTitle}</Text>

      {/* Days to finish */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>📅 How many days to finish?</Text>
        <View style={styles.chipRow}>
          {[7, 14, 21, 30].map(d => (
            <TouchableOpacity 
              key={d}
              style={[styles.chip, !isCustomDays && days === d ? styles.chipActive : {}]}
              onPress={() => { setDays(d); setIsCustomDays(false); }}
            >
              <Text style={[styles.chipText, !isCustomDays && days === d ? styles.chipTextActive : {}]}>
                {d} days
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={[styles.chip, isCustomDays ? styles.chipActive : {}]}
            onPress={() => setIsCustomDays(true)}
          >
            <Text style={[styles.chipText, isCustomDays ? styles.chipTextActive : {}]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>
        {isCustomDays && (
          <TextInput
            style={styles.input}
            placeholder="Enter days"
            placeholderTextColor={colors.subtext}
            value={customDays}
            onChangeText={setCustomDays}
            keyboardType="number-pad"
          />
        )}
      </View>

      {/* Reminders count */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>🔔 Daily reminders</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4].map(num => (
            <TouchableOpacity 
              key={num}
              style={[styles.chip, remindersCount === num ? styles.chipActive : {}]}
              onPress={() => setRemindersCount(num)}
            >
              <Text style={[styles.chipText, remindersCount === num ? styles.chipTextActive : {}]}>
                {num} per day
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pace per session */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>📖 Pace per session</Text>
        <View style={styles.paceContainer}>
          <TouchableOpacity 
            style={[styles.paceBox, sessionPace === 'chapter' ? styles.paceBoxActive : {}]}
            onPress={() => setSessionPace('chapter')}
          >
            <Text style={[styles.paceBoxTitle, sessionPace === 'chapter' ? styles.paceBoxTitleActive : {}]}>Full Chapter</Text>
            <Text style={styles.paceBoxDesc}>Digests split at natural chapter limits.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paceBox, sessionPace === 'pages' ? styles.paceBoxActive : {}]}
            onPress={() => setSessionPace('pages')}
          >
            <Text style={[styles.paceBoxTitle, sessionPace === 'pages' ? styles.paceBoxTitleActive : {}]}>Fixed Pages</Text>
            <Text style={styles.paceBoxDesc}>Receive lessons every 10–15 pages.</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delivery times */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>⏰ Delivery times (Multi-select)</Text>
        <View style={styles.chipRowWrap}>
          {timeOptions.map(time => {
            const isSelected = selectedTimes.includes(time);
            return (
              <TouchableOpacity 
                key={time}
                style={[styles.timeChip, isSelected ? styles.timeChipActive : {}]}
                onPress={() => toggleTime(time)}
              >
                <Text style={[styles.timeChipText, isSelected ? styles.timeChipTextActive : {}]}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Delivery channel */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>💬 Delivery Channel</Text>
        <View style={styles.channelRow}>
          {[
            { key: 'app', label: 'App' },
            { key: 'whatsapp', label: 'WhatsApp' },
            { key: 'telegram', label: 'Telegram' }
          ].map(ch => (
            <TouchableOpacity 
              key={ch.key}
              style={[styles.channelBox, deliveryChannel === ch.key ? styles.channelBoxActive : {}]}
              onPress={() => setDeliveryChannel(ch.key as any)}
            >
              <Text style={[styles.channelBoxText, deliveryChannel === ch.key ? styles.channelBoxTextActive : {}]}>
                {ch.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Activate Plan</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  bookTitle: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.text,
    width: 120,
  },
  paceContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paceBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#fff',
  },
  paceBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  paceBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  paceBoxTitleActive: {
    color: colors.primary,
  },
  paceBoxDesc: {
    fontSize: 10,
    color: colors.subtext,
    marginTop: 4,
    lineHeight: 14,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  timeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  timeChipText: {
    fontSize: 11,
    color: colors.subtext,
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#fff',
  },
  channelRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  channelBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  channelBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  channelBoxText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.subtext,
  },
  channelBoxTextActive: {
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  saveBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    ...shadows.primary,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
