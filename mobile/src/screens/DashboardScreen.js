import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, sumByField, getCurrentMonth } from '../utils/helpers';
import { getContextualWisdom, SEVEN_LAWS } from '../data/babylonWisdom';
import { colors, fonts } from '../theme';

export default function DashboardScreen() {
  const { state } = useApp();
  const currency = state.settings.currency || 'USD';

  const totalIncome = sumByField(state.incomes, 'amount');
  const totalExpenses = sumByField(state.expenses, 'amount');
  const totalSavings = totalIncome - totalExpenses;
  const totalInvestments = sumByField(state.investments, 'currentValue');
  const wisdom = getContextualWisdom({ totalIncome, totalSavings, totalExpenses, totalInvestments });

  // Monthly Babylon Split
  const currentMonth = getCurrentMonth();
  const monthlyIncome = sumByField(state.incomes.filter(i => i.date?.startsWith(currentMonth)), 'amount');
  const savingsAmount = monthlyIncome * (state.settings.savingsRate / 100);
  const investAmount = monthlyIncome * (state.settings.investmentRate / 100);
  const livingAmount = monthlyIncome * (state.settings.livingRate / 100);

  const stats = [
    { label: 'Total Income', value: totalIncome, color: colors.gold, icon: '$' },
    { label: 'Expenses', value: totalExpenses, color: colors.red, icon: '-' },
    { label: 'Savings', value: totalSavings, color: colors.emerald, icon: '+' },
    { label: 'Investments', value: totalInvestments, color: colors.blue, icon: '%' },
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
            <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
              <Text style={[styles.statIconText, { color: s.color }]}>{s.icon}</Text>
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{formatCurrency(s.value, currency)}</Text>
          </View>
        ))}
      </View>

      {/* Babylon Split */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>The Babylon Split (This Month)</Text>
        <View style={styles.splitRow}>
          <View style={[styles.splitSegment, { backgroundColor: colors.emerald, flex: state.settings.savingsRate || 1 }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.blue, flex: state.settings.investmentRate || 1 }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.orange, flex: state.settings.livingRate || 1 }]} />
        </View>
        <View style={styles.splitDetails}>
          <View style={styles.splitItem}>
            <View style={styles.splitItemLeft}>
              <View style={[styles.splitDot, { backgroundColor: colors.emerald }]} />
              <Text style={styles.splitItemLabel}>Save</Text>
            </View>
            <Text style={styles.splitPct}>{state.settings.savingsRate}%</Text>
            <Text style={[styles.splitAmount, { color: colors.emerald }]}>{formatCurrency(savingsAmount, currency)}</Text>
          </View>
          <View style={styles.splitItem}>
            <View style={styles.splitItemLeft}>
              <View style={[styles.splitDot, { backgroundColor: colors.blue }]} />
              <Text style={styles.splitItemLabel}>Invest</Text>
            </View>
            <Text style={styles.splitPct}>{state.settings.investmentRate}%</Text>
            <Text style={[styles.splitAmount, { color: colors.blue }]}>{formatCurrency(investAmount, currency)}</Text>
          </View>
          <View style={styles.splitItem}>
            <View style={styles.splitItemLeft}>
              <View style={[styles.splitDot, { backgroundColor: colors.orange }]} />
              <Text style={styles.splitItemLabel}>Live</Text>
            </View>
            <Text style={styles.splitPct}>{state.settings.livingRate}%</Text>
            <Text style={[styles.splitAmount, { color: colors.orange }]}>{formatCurrency(livingAmount, currency)}</Text>
          </View>
        </View>
      </View>

      {/* 7 Laws */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>The 7 Laws of Wealth</Text>
        {SEVEN_LAWS.map(law => (
          <View key={law.id} style={styles.lawRow}>
            <View style={styles.lawHeader}>
              <View style={[styles.lawIcon, { backgroundColor: law.color + '18' }]}>
                <Text style={[styles.lawIconText, { color: law.color }]}>{law.id}</Text>
              </View>
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
              <View style={[styles.txIcon, { backgroundColor: tx.txType === 'income' ? colors.emerald + '15' : colors.red + '15' }]}>
                <Text style={{ color: tx.txType === 'income' ? colors.emerald : colors.red, fontWeight: '700', fontSize: 14 }}>
                  {tx.txType === 'income' ? '+' : '-'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txName}>{tx.source || tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.txType === 'income' ? colors.emerald : colors.red }]}>
                {tx.txType === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
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
    margin: 16, padding: 20, borderRadius: 16,
    backgroundColor: colors.navy,
    elevation: 4, shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  wisdomLabel: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  wisdomText: { fontSize: 14, color: '#ffffffcc', fontStyle: 'italic', lineHeight: 22 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  statCard: {
    width: '46%', margin: '2%', padding: 16, borderRadius: 16,
    backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statIconText: { fontSize: 16, fontWeight: '700' },
  statLabel: { ...fonts.statLabel },
  statValue: { ...fonts.statValue, marginTop: 4 },

  // Babylon Split
  splitRow: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 16 },
  splitSegment: { height: '100%' },
  splitDetails: { gap: 0 },
  splitItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  splitItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  splitDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  splitItemLabel: { fontSize: 14, fontWeight: '600', color: colors.gray700 },
  splitPct: { fontSize: 13, fontWeight: '600', color: colors.gray400, width: 40, textAlign: 'center' },
  splitAmount: { fontSize: 16, fontWeight: '700', width: 100, textAlign: 'right' },

  card: {
    margin: 16, padding: 20, borderRadius: 16,
    backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 16 },
  lawRow: { marginBottom: 14 },
  lawHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  lawIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  lawIconText: { fontSize: 12, fontWeight: '700' },
  lawName: { fontSize: 13, fontWeight: '600', color: colors.gray700 },
  progressBar: { height: 6, backgroundColor: colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  // Transactions
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txName: { fontSize: 14, fontWeight: '600', color: colors.gray800 },
  txDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.gray400, paddingVertical: 20 },
});
