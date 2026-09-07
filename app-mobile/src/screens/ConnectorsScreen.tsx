import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Switch
} from 'react-native';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export default function ConnectorsScreen() {
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [googleDriveEnabled, setGoogleDriveEnabled] = useState(false);
  const [kindleEnabled, setKindleEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTelegram() {
      try {
        const s = await api.telegramStatus();
        setTelegramEnabled(s.enabled);
      } catch {
        // non-fatal
      } finally {
        setLoading(false);
      }
    }
    loadTelegram();
  }, []);

  const handleToggle = async (type: string, val: boolean) => {
    if (type === 'telegram') {
      if (val) {
        try {
          const { deep_link } = await api.telegramLinkCode();
          Alert.alert('Connect Telegram', 'Opening Telegram to complete Bot verification.');
          setTelegramEnabled(true);
        } catch {
          setTelegramEnabled(false);
        }
      } else {
        setTelegramEnabled(false);
      }
    } else if (type === 'whatsapp') {
      if (val) {
        // Prompt whatsapp
        Alert.alert(
          'Connect WhatsApp',
          'Use the web dashboard to wire WhatsApp BOT credentials correctly. Simulating connection.',
          [{ text: 'OK', onPress: () => setWhatsappEnabled(true) }]
        );
      } else {
        await api.updateWhatsapp(null, false);
        setWhatsappEnabled(false);
      }
    } else if (type === 'google_drive') {
      setGoogleDriveEnabled(val);
    } else if (type === 'kindle') {
      setKindleEnabled(val);
    } else if (type === 'email') {
      setEmailEnabled(val);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const connectorList = [
    { id: 'google_drive', name: 'Google Drive', desc: 'Import books automatically from Google Drive.', enabled: googleDriveEnabled, emoji: '📁' },
    { id: 'kindle', name: 'Kindle Sync', desc: 'Sync highlights and push digests to your Kindle.', enabled: kindleEnabled, emoji: '📖' },
    { id: 'whatsapp', name: 'WhatsApp Bot', desc: 'Receive lessons and study daily via WhatsApp.', enabled: whatsappEnabled, emoji: '💬' },
    { id: 'telegram', name: 'Telegram Bot', desc: 'Deliver digests and flashcards via Telegram.', enabled: telegramEnabled, emoji: '⚡' },
    { id: 'email', name: 'Email digests', desc: 'Daily learning newsletters via email summaries.', enabled: emailEnabled, emoji: '✉️' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Connectors</Text>
      <Text style={styles.subtitle}>Deliver summaries and retrieve books from any source</Text>

      <View style={styles.card}>
        <Text style={styles.cardInfoTitle}>📌 Multi-channel learning</Text>
        <Text style={styles.cardInfoText}>
          Tutor bots deliver lessons and flashcards on your preferred channel. Toggle connection switches below to manage delivery channels.
        </Text>
      </View>

      <View style={styles.list}>
        {connectorList.map(c => (
          <View key={c.id} style={styles.row}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{c.emoji}</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.desc}>{c.desc}</Text>
            </View>
            <Switch
              value={c.enabled}
              onValueChange={(val) => handleToggle(c.id, val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
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
  card: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#D3CCFF',
    marginBottom: spacing.lg,
  },
  cardInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  cardInfoText: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 15,
    marginTop: 2,
  },
  list: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 18,
  },
  details: {
    flex: 1,
    marginRight: spacing.xs,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontSize: 10,
    color: colors.subtext,
    marginTop: 2,
    lineHeight: 14,
  },
});
