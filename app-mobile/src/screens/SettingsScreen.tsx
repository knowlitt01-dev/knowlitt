import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native';
import { api, ApiError } from '../lib/api';
import { colors, spacing, radius } from '../lib/theme';

export default function SettingsScreen() {
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramConfigured, setTelegramConfigured] = useState(true);

  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappConfigured, setWhatsappConfigured] = useState(true);
  const [whatsappSaving, setWhatsappSaving] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');

  const [billing, setBilling] = useState<any>(null);

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    api.telegramStatus().then((s) => setTelegramEnabled(s.enabled)).catch(() => {});
    api.billingStatus().then(setBilling).catch(() => {});
  }, []);

  async function handleConnectTelegram() {
    const { deep_link, configured } = await api.telegramLinkCode();
    setTelegramConfigured(configured);
    if (configured) Linking.openURL(deep_link);
  }

  async function handleWhatsappSave() {
    setWhatsappError('');
    setWhatsappSaving(true);
    try {
      const result = await api.updateWhatsapp(whatsappNumber, true);
      setWhatsappConfigured(result.configured);
      setWhatsappEnabled(result.whatsapp_enabled);
    } catch (err) {
      setWhatsappError(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setWhatsappSaving(false);
    }
  }

  async function handleWhatsappDisconnect() {
    await api.updateWhatsapp(null, false);
    setWhatsappEnabled(false);
  }

  async function handleTicketSubmit() {
    if (!ticketSubject || !ticketMessage) return;
    await api.createTicket(ticketSubject, ticketMessage);
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Subscription */}
      <Text style={styles.sectionTitle}>Subscription</Text>
      <View style={styles.card}>
        {billing ? (
          <>
            <Text style={styles.statusText}>{billing.subscription_status}</Text>
            {billing.subscription_status === 'trialing' && (
              <Text style={styles.subText}>
                {billing.trial_days_remaining} day{billing.trial_days_remaining !== 1 ? 's' : ''} left in your free trial
              </Text>
            )}
            {!billing.razorpay_configured && (
              <Text style={styles.warnText}>
                Billing isn't configured yet — see BILLING.md.
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.subText}>Loading...</Text>
        )}
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.rowTitle}>Telegram</Text>
            <Text style={styles.subText}>{telegramEnabled ? 'Connected' : 'Not connected'}</Text>
          </View>
          {!telegramEnabled && (
            <TouchableOpacity style={styles.smallButton} onPress={handleConnectTelegram}>
              <Text style={styles.smallButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
        {!telegramConfigured && (
          <Text style={styles.warnText}>Telegram isn't configured on the server yet — see NOTIFICATIONS.md.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.rowTitle}>WhatsApp</Text>
        <Text style={styles.subText}>{whatsappEnabled ? 'Connected' : 'Not connected'}</Text>
        {!whatsappEnabled ? (
          <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
            <TextInput
              style={styles.input}
              placeholder="+91XXXXXXXXXX"
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
              keyboardType="phone-pad"
            />
            {whatsappError ? <Text style={styles.errorText}>{whatsappError}</Text> : null}
            <TouchableOpacity style={styles.smallButton} onPress={handleWhatsappSave} disabled={whatsappSaving}>
              <Text style={styles.smallButtonText}>{whatsappSaving ? 'Saving...' : 'Connect WhatsApp'}</Text>
            </TouchableOpacity>
            {!whatsappConfigured && (
              <Text style={styles.warnText}>WhatsApp isn't configured on the server yet — see NOTIFICATIONS.md.</Text>
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={handleWhatsappDisconnect} style={{ marginTop: spacing.sm }}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Support */}
      <Text style={styles.sectionTitle}>Contact Support</Text>
      <View style={styles.card}>
        {ticketSubmitted ? (
          <Text style={styles.successText}>Thanks — we've got your message and will follow up soon.</Text>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={ticketSubject}
              onChangeText={setTicketSubject}
            />
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Describe the issue..."
              value={ticketMessage}
              onChangeText={setTicketMessage}
              multiline
            />
            <TouchableOpacity style={styles.smallButton} onPress={handleTicketSubmit}>
              <Text style={styles.smallButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray900, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.gray200, marginBottom: spacing.sm,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontWeight: '600', color: colors.gray900, fontSize: 15 },
  statusText: { fontWeight: '600', color: colors.gray900, fontSize: 15, textTransform: 'capitalize' },
  subText: { color: colors.gray500, fontSize: 13, marginTop: 2 },
  warnText: { color: '#b45309', fontSize: 12, marginTop: spacing.sm },
  errorText: { color: colors.red600, fontSize: 12 },
  successText: { color: colors.green600, fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15,
  },
  smallButton: {
    backgroundColor: colors.gray100, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 8, alignSelf: 'flex-start',
  },
  smallButtonText: { fontWeight: '600', color: colors.gray900, fontSize: 13 },
  disconnectText: { color: colors.red600, fontSize: 13, fontWeight: '500' },
});
