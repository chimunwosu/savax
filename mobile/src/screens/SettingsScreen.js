import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { colors, fonts } from '../theme';

const CURRENCIES = ['USD', 'NGN', 'EUR', 'GBP', 'CAD', 'AUD'];

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const s = state.settings;

  function updateSetting(key, value) {
    const updates = { [key]: value };
    if (['savingsRate', 'investmentRate'].includes(key)) {
      const numVal = Number(value) || 0;
      if (key === 'savingsRate') {
        updates.livingRate = Math.max(0, 100 - numVal - s.investmentRate);
      } else {
        updates.livingRate = Math.max(0, 100 - s.savingsRate - numVal);
      }
    }
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  }

  function handleClear() {
    Alert.alert(
      'Clear All Data',
      'This will delete all your income, expenses, investments, goals, and debts. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => dispatch({ type: 'IMPORT_DATA', payload: {} }) },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        <Text style={styles.inputLabel}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={s.name}
          onChangeText={v => updateSetting('name', v)}
        />
      </View>

      {/* Wealth Split */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wealth Allocation (Must equal 100%)</Text>

        <View style={styles.splitRow}>
          <View style={[styles.splitSegment, { backgroundColor: colors.emerald, flex: s.savingsRate || 1 }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.blue, flex: s.investmentRate || 1 }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.orange, flex: s.livingRate || 1 }]} />
        </View>

        <View style={styles.rateRow}>
          <View style={styles.rateItem}>
            <View style={[styles.rateDot, { backgroundColor: colors.emerald }]} />
            <Text style={styles.rateLabel}>Save</Text>
            <TextInput
              style={styles.rateInput}
              keyboardType="numeric"
              value={String(s.savingsRate)}
              onChangeText={v => updateSetting('savingsRate', Number(v) || 0)}
            />
            <Text style={styles.ratePct}>%</Text>
          </View>
          <View style={styles.rateItem}>
            <View style={[styles.rateDot, { backgroundColor: colors.blue }]} />
            <Text style={styles.rateLabel}>Invest</Text>
            <TextInput
              style={styles.rateInput}
              keyboardType="numeric"
              value={String(s.investmentRate)}
              onChangeText={v => updateSetting('investmentRate', Number(v) || 0)}
            />
            <Text style={styles.ratePct}>%</Text>
          </View>
          <View style={styles.rateItem}>
            <View style={[styles.rateDot, { backgroundColor: colors.orange }]} />
            <Text style={styles.rateLabel}>Live</Text>
            <Text style={styles.rateFixed}>{s.livingRate}%</Text>
          </View>
        </View>
      </View>

      {/* Currency */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Currency</Text>
        <View style={styles.currencyRow}>
          {CURRENCIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.currencyBtn, s.currency === c && styles.currencyBtnActive]}
              onPress={() => updateSetting('currency', c)}
            >
              <Text style={[styles.currencyText, s.currency === c && styles.currencyTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Management</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClear}>
          <Text style={styles.dangerBtnText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.gold }]}>
        <Text style={styles.aboutTitle}>Savax v1.0</Text>
        <Text style={styles.aboutText}>
          Built on the timeless wealth principles from The Richest Man in Babylon by George S. Clason. Your data is stored locally on your device.
        </Text>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  card: { padding: 16, borderRadius: 12, backgroundColor: colors.white, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '500', color: colors.gray600, marginBottom: 4 },
  input: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, fontSize: 15 },
  splitRow: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 16 },
  splitSegment: { height: '100%' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rateItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  rateDot: { width: 8, height: 8, borderRadius: 4 },
  rateLabel: { fontSize: 12, fontWeight: '500', color: colors.gray600 },
  rateInput: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 6, padding: 6, fontSize: 14, width: 40, textAlign: 'center' },
  ratePct: { fontSize: 12, color: colors.gray500 },
  rateFixed: { fontSize: 14, fontWeight: '600', color: colors.gray700 },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.gray100 },
  currencyBtnActive: { backgroundColor: colors.gold },
  currencyText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  currencyTextActive: { color: colors.navy },
  dangerBtn: { padding: 14, borderRadius: 10, backgroundColor: colors.red + '12', alignItems: 'center' },
  dangerBtnText: { fontSize: 14, fontWeight: '600', color: colors.red },
  aboutTitle: { fontSize: 14, fontWeight: '700', color: colors.gold, marginBottom: 4 },
  aboutText: { fontSize: 12, color: colors.gray500, lineHeight: 18 },
});
