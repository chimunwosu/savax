import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES } from '../data/babylonWisdom';
import { formatCurrency, getMonthRange, groupByMonth, sumByField } from '../utils/helpers';
import { colors, fonts } from '../theme';

export default function ReportsScreen() {
  const { state } = useApp();

  const { monthlyData, categoryData, insights } = useMemo(() => {
    const months = getMonthRange(6);
    const incomeByMonth = groupByMonth(state.incomes);
    const expenseByMonth = groupByMonth(state.expenses);

    const monthlyData = months.map(m => {
      const income = sumByField(incomeByMonth[m] || [], 'amount');
      const expenses = sumByField(expenseByMonth[m] || [], 'amount');
      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;
      const label = new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' });
      return { month: label, income, expenses, savings, savingsRate: Math.round(savingsRate) };
    });

    const catTotals = {};
    state.expenses.forEach(e => {
      const name = EXPENSE_CATEGORIES.find(c => c.id === e.category)?.name || e.category;
      catTotals[name] = (catTotals[name] || 0) + Number(e.amount);
    });
    const categoryData = Object.entries(catTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const validMonths = monthlyData.filter(m => m.income > 0);
    const avgSavingsRate = validMonths.length > 0
      ? validMonths.reduce((s, m) => s + m.savingsRate, 0) / validMonths.length : 0;
    const bestMonth = validMonths.reduce((best, m) => m.savingsRate > (best?.savingsRate || -Infinity) ? m : best, null);
    const topCategory = categoryData[0];

    return { monthlyData, categoryData, insights: { avgSavingsRate, bestMonth, topCategory } };
  }, [state.incomes, state.expenses]);

  const totalExpenses = sumByField(state.expenses, 'amount');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Insights */}
      <View style={styles.insightsRow}>
        <View style={styles.insightBox}>
          <Text style={styles.insightLabel}>Avg Savings Rate</Text>
          <Text style={[styles.insightValue, { color: insights.avgSavingsRate >= 10 ? colors.emerald : colors.red }]}>
            {insights.avgSavingsRate.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.insightBox}>
          <Text style={styles.insightLabel}>Best Month</Text>
          <Text style={[styles.insightValue, { color: colors.gold }]}>
            {insights.bestMonth?.month || '-'}
          </Text>
        </View>
        <View style={styles.insightBox}>
          <Text style={styles.insightLabel}>Top Expense</Text>
          <Text style={[styles.insightValue, { color: colors.orange }]} numberOfLines={1}>
            {insights.topCategory?.name || '-'}
          </Text>
        </View>
      </View>

      {/* Monthly Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Breakdown (Last 6 Months)</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { flex: 1 }]}>Month</Text>
          <Text style={[styles.tableCol, { flex: 1.2, textAlign: 'right' }]}>Income</Text>
          <Text style={[styles.tableCol, { flex: 1.2, textAlign: 'right' }]}>Expenses</Text>
          <Text style={[styles.tableCol, { flex: 0.8, textAlign: 'right' }]}>Rate</Text>
        </View>
        {monthlyData.map((m, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{m.month}</Text>
            <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right', color: colors.emerald }]}>{formatCurrency(m.income)}</Text>
            <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right', color: colors.red }]}>{formatCurrency(m.expenses)}</Text>
            <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right', fontWeight: '700', color: m.savingsRate >= 10 ? colors.emerald : colors.red }]}>
              {m.savingsRate}%
            </Text>
          </View>
        ))}
      </View>

      {/* Expense Categories */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending by Category</Text>
        {categoryData.length === 0 ? (
          <Text style={styles.emptyText}>No expenses recorded yet</Text>
        ) : categoryData.map((cat, i) => {
          const pct = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
          const catColor = EXPENSE_CATEGORIES.find(c => c.name === cat.name)?.color || colors.gray500;
          return (
            <View key={i} style={styles.catRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <View style={[styles.catDot, { backgroundColor: catColor }]} />
                <Text style={styles.catName}>{cat.name}</Text>
              </View>
              <Text style={styles.catAmount}>{formatCurrency(cat.value)}</Text>
              <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  insightsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  insightBox: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  insightLabel: { ...fonts.statLabel, textAlign: 'center' },
  insightValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  card: { padding: 16, borderRadius: 12, backgroundColor: colors.white, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: colors.gray200 },
  tableCol: { fontSize: 10, fontWeight: '600', color: colors.gray500, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  tableCell: { fontSize: 13, color: colors.gray700 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 13, color: colors.gray700, flex: 1 },
  catAmount: { fontSize: 13, fontWeight: '600', color: colors.gray800, width: 80, textAlign: 'right' },
  catPct: { fontSize: 12, fontWeight: '600', color: colors.gray500, width: 40, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: colors.gray400, paddingVertical: 20 },
});
