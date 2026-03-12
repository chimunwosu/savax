import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, sumByField } from '../utils/helpers';
import { getRandomWisdom, SEVEN_LAWS } from '../data/babylonWisdom';
import { colors } from '../theme';

export default function MoreScreen() {
  const { state } = useApp();
  const totalIncome = sumByField(state.incomes, 'amount');
  const totalExpenses = sumByField(state.expenses, 'amount');
  const totalInvested = sumByField(state.investments, 'investedAmount');
  const totalDebt = sumByField(state.debts, 'balance');
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  let score = 0;
  score += Math.min(25, savingsRate * 2.5);
  score += totalExpenses <= totalIncome * 0.7 ? 25 : 10;
  score += Math.min(20, totalIncome > 0 ? (totalInvested / totalIncome) * 100 : 0);
  score += totalDebt === 0 ? 15 : 5;
  score += Math.min(15, state.goals.length > 0 ? 10 : 0);
  score = Math.round(Math.max(0, Math.min(100, score)));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  const gradeColor = score >= 75 ? colors.emerald : score >= 50 ? colors.gold : colors.red;

  const wisdom = getRandomWisdom();

  const netWorth = sumByField(state.investments, 'currentValue') + state.goals.reduce((s, g) => s + (g.currentAmount || 0), 0) - totalDebt;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Health Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>FINANCIAL HEALTH</Text>
        <Text style={[styles.scoreGrade, { color: gradeColor }]}>{grade}</Text>
        <Text style={[styles.scoreNum, { color: gradeColor }]}>{score}/100</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${score}%`, backgroundColor: gradeColor }]} />
        </View>
      </View>

      {/* Wisdom */}
      <View style={styles.wisdomCard}>
        <Text style={styles.wisdomLabel}>DAILY WISDOM</Text>
        <Text style={styles.wisdomText}>"{wisdom}"</Text>
      </View>

      {/* Net Worth */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Net Worth</Text>
        <Text style={[styles.netWorthValue, { color: netWorth >= 0 ? colors.gold : colors.red }]}>{formatCurrency(netWorth)}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        {[
          { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 10 ? colors.emerald : colors.red },
          { label: 'Investments', value: formatCurrency(totalInvested), color: colors.blue },
          { label: 'Total Debt', value: formatCurrency(totalDebt), color: totalDebt > 0 ? colors.red : colors.emerald },
          { label: 'Active Goals', value: `${state.goals.length}`, color: colors.gold },
        ].map((item, i) => (
          <View key={i} style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>{item.label}</Text>
            <Text style={[styles.overviewValue, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* 7 Laws */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>The 7 Laws of Wealth</Text>
        {SEVEN_LAWS.map(law => (
          <View key={law.id} style={styles.lawItem}>
            <View style={[styles.lawDot, { backgroundColor: law.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lawTitle}>{law.short}</Text>
              <Text style={styles.lawDesc} numberOfLines={1}>{law.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* About */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.gold }]}>
        <Text style={styles.aboutTitle}>Savax v1.0</Text>
        <Text style={styles.aboutText}>
          Built on the timeless wisdom of The Richest Man in Babylon. Your data is stored locally on your device.
        </Text>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  scoreCard: {
    alignItems: 'center', padding: 24, borderRadius: 12, backgroundColor: colors.white,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, marginBottom: 12,
  },
  scoreLabel: { fontSize: 11, color: colors.gray500, letterSpacing: 1, fontWeight: '600' },
  scoreGrade: { fontSize: 48, fontWeight: '700', marginTop: 4 },
  scoreNum: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  progressBar: { width: '100%', height: 6, backgroundColor: colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  wisdomCard: {
    padding: 20, borderRadius: 12, backgroundColor: colors.navy, marginBottom: 12,
  },
  wisdomLabel: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  wisdomText: { fontSize: 14, color: '#ffffffcc', fontStyle: 'italic', lineHeight: 22 },
  card: {
    padding: 16, borderRadius: 12, backgroundColor: colors.white, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  netWorthValue: { fontSize: 28, fontWeight: '700', textAlign: 'center', paddingVertical: 8 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  overviewLabel: { fontSize: 13, color: colors.gray600 },
  overviewValue: { fontSize: 14, fontWeight: '700' },
  lawItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  lawDot: { width: 8, height: 8, borderRadius: 4 },
  lawTitle: { fontSize: 13, fontWeight: '600', color: colors.gray800 },
  lawDesc: { fontSize: 11, color: colors.gray400, marginTop: 1 },
  aboutTitle: { fontSize: 14, fontWeight: '700', color: colors.gold, marginBottom: 4 },
  aboutText: { fontSize: 12, color: colors.gray500, lineHeight: 18 },
});
