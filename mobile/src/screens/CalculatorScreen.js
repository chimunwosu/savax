import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { colors, fonts } from '../theme';

export default function CalculatorScreen() {
  const { state } = useApp();
  const currency = state.settings.currency || 'USD';
  const [principal, setPrincipal] = useState('1000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('10');

  const { futureValue, totalContributions, totalInterest, milestones } = useMemo(() => {
    let balance = Number(principal) || 0;
    const monthlyRate = (Number(rate) || 0) / 100 / 12;
    const monthlyAmount = Number(monthly) || 0;
    let totalContrib = Number(principal) || 0;
    const milestones = [];

    for (let y = 1; y <= (Number(years) || 1); y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + monthlyAmount;
        totalContrib += monthlyAmount;
      }
      if (y % Math.max(1, Math.floor(Number(years) / 5)) === 0 || y === Number(years)) {
        milestones.push({ year: y, balance: Math.round(balance), contributions: Math.round(totalContrib), interest: Math.round(balance - totalContrib) });
      }
    }

    return {
      futureValue: balance,
      totalContributions: totalContrib,
      totalInterest: balance - totalContrib,
      milestones,
    };
  }, [principal, monthly, rate, years]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>FUTURE VALUE</Text>
        <Text style={styles.resultValue}>{formatCurrency(futureValue, currency)}</Text>
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Contributions</Text>
            <Text style={[styles.resultItemValue, { color: colors.blue }]}>{formatCurrency(totalContributions, currency)}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Interest Earned</Text>
            <Text style={[styles.resultItemValue, { color: colors.emerald }]}>{formatCurrency(totalInterest, currency)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calculator Inputs</Text>

        <Text style={styles.fieldLabel}>Starting Amount</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={principal} onChangeText={setPrincipal} placeholderTextColor={colors.gray300} />

        <Text style={styles.fieldLabel}>Monthly Contribution</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={monthly} onChangeText={setMonthly} placeholderTextColor={colors.gray300} />

        <Text style={styles.fieldLabel}>Annual Interest Rate (%)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} placeholderTextColor={colors.gray300} />

        <Text style={styles.fieldLabel}>Time Period (years)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={years} onChangeText={setYears} placeholderTextColor={colors.gray300} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Growth Milestones</Text>
        {milestones.map((m, i) => (
          <View key={i} style={styles.milestoneRow}>
            <View style={styles.milestoneLeft}>
              <View style={[styles.milestoneIcon, { backgroundColor: colors.gold + '15' }]}>
                <Text style={{ color: colors.gold, fontWeight: '700', fontSize: 11 }}>Y{m.year}</Text>
              </View>
              <Text style={styles.milestoneYear}>Year {m.year}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.milestoneBalance}>{formatCurrency(m.balance, currency)}</Text>
              <Text style={styles.milestoneInterest}>Interest: {formatCurrency(m.interest, currency)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.gold }]}>
        <Text style={styles.tipTitle}>The Power of Compound Interest</Text>
        <Text style={styles.tipText}>
          Put your money to work so it earns more money for you. Even small monthly contributions grow significantly over time thanks to compound interest.
        </Text>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  resultCard: { alignItems: 'center', padding: 28, borderRadius: 16, backgroundColor: colors.navy, marginBottom: 16, elevation: 4, shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  resultLabel: { fontSize: 12, color: colors.gold, letterSpacing: 1.5, fontWeight: '700' },
  resultValue: { fontSize: 34, fontWeight: '700', color: colors.white, marginTop: 6 },
  resultRow: { flexDirection: 'row', marginTop: 18, gap: 28 },
  resultItem: { alignItems: 'center' },
  resultItemLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase', fontWeight: '600' },
  resultItemValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  card: { padding: 18, borderRadius: 16, backgroundColor: colors.white, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, color: colors.gray800 },
  milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  milestoneLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  milestoneYear: { fontSize: 14, fontWeight: '600', color: colors.gray700 },
  milestoneBalance: { fontSize: 16, fontWeight: '700', color: colors.gold },
  milestoneInterest: { fontSize: 12, color: colors.emerald, marginTop: 2, fontWeight: '600' },
  tipTitle: { fontSize: 14, fontWeight: '700', color: colors.gold, marginBottom: 6 },
  tipText: { fontSize: 13, color: colors.gray600, lineHeight: 20 },
});
