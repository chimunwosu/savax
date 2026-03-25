import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { colors, fonts } from '../theme';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: 'N' },
  { code: 'EUR', name: 'Euro', symbol: 'E' },
  { code: 'GBP', name: 'British Pound', symbol: 'L' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
];

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const s = state.settings;
  const currency = s.currency || 'USD';

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
        <Text style={styles.fieldLabel}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={colors.gray300}
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
            <View style={styles.rateFixedWrap}>
              <Text style={styles.rateFixed}>{s.livingRate}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Currency */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Currency</Text>
        <Text style={styles.currencyHint}>Select your preferred currency for all amounts</Text>
        <View style={styles.currencyGrid}>
          {CURRENCIES.map(c => (
            <TouchableOpacity
              key={c.code}
              style={[styles.currencyBtn, currency === c.code && styles.currencyBtnActive]}
              onPress={() => updateSetting('currency', c.code)}
              activeOpacity={0.7}
            >
              <Text style={[styles.currencyCode, currency === c.code && styles.currencyCodeActive]}>{c.code}</Text>
              <Text style={[styles.currencyName, currency === c.code && styles.currencyNameActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Management</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClear} activeOpacity={0.7}>
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
  card: { padding: 18, borderRadius: 16, backgroundColor: colors.white, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, color: colors.gray800 },
  splitRow: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 18 },
  splitSegment: { height: '100%' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rateItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  rateDot: { width: 10, height: 10, borderRadius: 5 },
  rateLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  rateInput: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 8, padding: 6, fontSize: 15, width: 42, textAlign: 'center', fontWeight: '700', color: colors.gray800 },
  ratePct: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  rateFixedWrap: { backgroundColor: colors.gray100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  rateFixed: { fontSize: 15, fontWeight: '700', color: colors.gray700 },
  currencyHint: { fontSize: 12, color: colors.gray400, marginBottom: 12 },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  currencyBtn: { width: '30%', padding: 14, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  currencyBtnActive: { backgroundColor: colors.gold + '15', borderColor: colors.gold },
  currencyCode: { fontSize: 16, fontWeight: '700', color: colors.gray500 },
  currencyCodeActive: { color: colors.navy },
  currencyName: { fontSize: 10, color: colors.gray400, marginTop: 2 },
  currencyNameActive: { color: colors.gold, fontWeight: '600' },
  dangerBtn: { padding: 16, borderRadius: 14, backgroundColor: colors.red + '10', alignItems: 'center', borderWidth: 1.5, borderColor: colors.red + '25' },
  dangerBtnText: { fontSize: 15, fontWeight: '700', color: colors.red },
  aboutTitle: { fontSize: 14, fontWeight: '700', color: colors.gold, marginBottom: 4 },
  aboutText: { fontSize: 12, color: colors.gray500, lineHeight: 18 },
});
