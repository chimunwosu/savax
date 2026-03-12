import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, sumByField } from '../utils/helpers';
import { getContextualWisdom, SEVEN_LAWS } from '../data/babylonWisdom';
import { colors, fonts } from '../theme';

export default function DashboardScreen() {
  const { state } = useApp();

  const totalIncome = sumByField(state.incomes, 'amount');
  const totalExpenses = sumByField(state.expenses, 'amount');
  const totalSavings = totalIncome - totalExpenses;
  const totalInvestments = sumByField(state.investments, 'currentValue');
  const wisdom = getContextualWisdom({ totalIncome, totalSavings, totalExpenses, totalInvestments });

  const stats = [
    { label: 'Total Income', value: totalIncome, color: colors.gold },
    { label: 'Expenses', value: totalExpenses, color: colors.red },
    { label: 'Savings', value: totalSavings, color: colors.emerald },
    { label: 'Investments', value: totalInvestments, color: colors.blue },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Wisdom Banner */}
      <View style={styles.wisdomBanner}>
        <Text style={styles.wisdomLabel}>WISDOM OF BABYLON</Text>
        <Text style={styles.wisdomText}>{wisdom}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: s.color }]} />
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{formatCurrency(s.value)}</Text>
          </View>
        ))}
      </View>

      {/* 7 Laws */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>The 7 Laws of Wealth</Text>
        {SEVEN_LAWS.map(law => (
          <View key={law.id} style={styles.lawRow}>
            <View style={styles.lawHeader}>
              <Text style={styles.lawName}>{law.short}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: law.color }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {[...state.incomes.map(i => ({ ...i, txType: 'income' })), ...state.expenses.map(e => ({ ...e, txType: 'expense' }))]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View>
                <Text style={styles.txName}>{tx.source || tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.txType === 'income' ? colors.emerald : colors.red }]}>
                {tx.txType === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </Text>
            </View>
          ))}
        {state.incomes.length === 0 && state.expenses.length === 0 && (
          <Text style={styles.emptyText}>No transactions yet</Text>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  wisdomBanner: {
    margin: 16, padding: 20, borderRadius: 12,
    backgroundColor: colors.navy,
  },
  wisdomLabel: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  wisdomText: { fontSize: 14, color: '#ffffffcc', fontStyle: 'italic', lineHeight: 22 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  statCard: {
    width: '46%', margin: '2%', padding: 16, borderRadius: 12,
    backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  statLabel: { ...fonts.statLabel },
  statValue: { ...fonts.statValue, marginTop: 4 },
  card: {
    margin: 16, padding: 20, borderRadius: 12,
    backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 16 },
  lawRow: { marginBottom: 12 },
  lawHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  lawName: { fontSize: 13, fontWeight: '500', color: colors.gray700 },
  progressBar: { height: 6, backgroundColor: colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  txName: { fontSize: 14, fontWeight: '500', color: colors.gray800 },
  txDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.gray400, paddingVertical: 20 },
});
