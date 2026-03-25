import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { formatCurrency } from '../utils/helpers';
import { colors, fonts } from '../theme';

export default function CalculatorScreen() {
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
        <Text style={styles.resultValue}>{formatCurrency(futureValue)}</Text>
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Contributions</Text>
            <Text style={[styles.resultItemValue, { color: colors.blue }]}>{formatCurrency(totalContributions)}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Interest Earned</Text>
            <Text style={[styles.resultItemValue, { color: colors.emerald }]}>{formatCurrency(totalInterest)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calculator Inputs</Text>
        <Text style={styles.inputLabel}>Starting Amount</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={principal} onChangeText={setPrincipal} />
        <Text style={styles.inputLabel}>Monthly Contribution</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={monthly} onChangeText={setMonthly} />
        <Text style={styles.inputLabel}>Annual Interest Rate (%)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} />
        <Text style={styles.inputLabel}>Time Period (years)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={years} onChangeText={setYears} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Growth Milestones</Text>
        {milestones.map((m, i) => (
          <View key={i} style={styles.milestoneRow}>
            <Text style={styles.milestoneYear}>Year {m.year}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.milestoneBalance}>{formatCurrency(m.balance)}</Text>
              <Text style={styles.milestoneInterest}>Interest: {formatCurrency(m.interest)}</Text>
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
  resultCard: { alignItems: 'center', padding: 24, borderRadius: 12, backgroundColor: colors.navy, marginBottom: 16 },
  resultLabel: { fontSize: 11, color: colors.gold, letterSpacing: 1, fontWeight: '600' },
  resultValue: { fontSize: 32, fontWeight: '700', color: colors.white, marginTop: 4 },
  resultRow: { flexDirection: 'row', marginTop: 16, gap: 24 },
  resultItem: { alignItems: 'center' },
  resultItemLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase' },
  resultItemValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  card: { padding: 16, borderRadius: 12, backgroundColor: colors.white, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '500', color: colors.gray600, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, fontSize: 15 },
  milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  milestoneYear: { fontSize: 13, fontWeight: '600', color: colors.gray700 },
  milestoneBalance: { fontSize: 15, fontWeight: '700', color: colors.gold },
  milestoneInterest: { fontSize: 11, color: colors.emerald, marginTop: 2 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: colors.gold, marginBottom: 6 },
  tipText: { fontSize: 13, color: colors.gray600, lineHeight: 20 },
});
