import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { SEVEN_LAWS, getRandomWisdom } from '../data/babylonWisdom';
import { formatCurrency, sumByField } from '../utils/helpers';
import { colors, fonts } from '../theme';

export default function AdvisorScreen() {
  const { state } = useApp();

  const analysis = useMemo(() => {
    const totalIncome = sumByField(state.incomes, 'amount');
    const totalExpenses = sumByField(state.expenses, 'amount');
    const totalInvested = sumByField(state.investments, 'investedAmount');
    const totalDebt = sumByField(state.debts, 'balance');
    const goalsSaved = state.goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    const goalsTarget = state.goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const budgetOk = totalIncome > 0 ? totalExpenses <= totalIncome * 0.7 : false;
    const investmentRate = totalIncome > 0 ? (totalInvested / totalIncome) * 100 : 0;
    const goalProgress = goalsTarget > 0 ? (goalsSaved / goalsTarget) * 100 : 0;

    let score = 0;
    score += Math.min(25, savingsRate * 2.5);
    score += budgetOk ? 25 : Math.min(25, (1 - (totalExpenses / Math.max(totalIncome * 0.7, 1))) * 25);
    score += Math.min(20, investmentRate);
    score += totalDebt === 0 ? 15 : Math.max(0, 15 - (totalDebt / Math.max(totalIncome, 1)) * 15);
    score += Math.min(15, goalProgress * 0.15);
    score = Math.round(Math.max(0, Math.min(100, score)));

    const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
    const gradeColor = score >= 75 ? colors.emerald : score >= 50 ? colors.gold : colors.red;

    const actions = [];
    if (totalIncome === 0) actions.push('Start by recording your income sources');
    if (savingsRate < 10 && totalIncome > 0) actions.push(`Increase savings to at least 10% (currently ${savingsRate.toFixed(1)}%)`);
    if (totalInvested === 0 && totalIncome > 0) actions.push('Begin investing to make your money grow');
    if (totalDebt > 0) actions.push(`Focus on eliminating ${formatCurrency(totalDebt)} in debt`);
    if (state.goals.length === 0) actions.push('Set a savings goal to stay motivated');
    if (!budgetOk && totalIncome > 0) actions.push('Reduce expenses to stay within 70% of income');
    if (actions.length === 0) actions.push('Keep up the excellent work! You follow the 7 wealth principles perfectly.');

    const lawData = SEVEN_LAWS.map((law, i) => {
      let progress = 0;
      let status = '';
      if (i === 0) { progress = Math.min(100, savingsRate * 10); status = savingsRate >= 10 ? 'Saving at least 10%' : `Currently at ${savingsRate.toFixed(1)}%`; }
      else if (i === 1) { progress = budgetOk ? 100 : Math.min(99, (totalIncome * 0.7 / Math.max(totalExpenses, 1)) * 100); status = budgetOk ? 'Within budget' : 'Over budget'; }
      else if (i === 2) { progress = Math.min(100, investmentRate * 5); status = totalInvested > 0 ? `${formatCurrency(totalInvested)} invested` : 'Start investing'; }
      else if (i === 3) { progress = totalDebt === 0 ? 100 : 50; status = totalDebt === 0 ? 'No risky debts' : 'Reduce debt exposure'; }
      else if (i === 4) { const has = state.assets.some(a => a.type === 'asset') || state.investments.length > 0; progress = has ? 75 : 0; status = has ? 'Own assets' : 'Acquire assets'; }
      else if (i === 5) { const has = state.goals.some(g => g.category === 'retirement'); progress = has ? 75 : 0; status = has ? 'Planning retirement' : 'Plan for future'; }
      else if (i === 6) { const has = state.expenses.some(e => e.category === 'education'); progress = has ? 75 : 0; status = has ? 'Investing in skills' : 'Invest in learning'; }
      return { ...law, progress: Math.round(progress), status };
    });

    return { score, grade, gradeColor, actions, lawData };
  }, [state]);

  const wisdom = useMemo(() => getRandomWisdom(), []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Health Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>FINANCIAL HEALTH SCORE</Text>
        <Text style={[styles.scoreGrade, { color: analysis.gradeColor }]}>{analysis.grade}</Text>
        <Text style={[styles.scoreNum, { color: analysis.gradeColor }]}>{analysis.score}/100</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${analysis.score}%`, backgroundColor: analysis.gradeColor }]} />
        </View>
      </View>

      {/* Daily Wisdom */}
      <View style={styles.wisdomCard}>
        <Text style={styles.wisdomLabel}>DAILY WISDOM</Text>
        <Text style={styles.wisdomText}>"{wisdom}"</Text>
      </View>

      {/* Action Items */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.gold }]}>
        <Text style={styles.cardTitle}>Action Items</Text>
        {analysis.actions.map((action, i) => (
          <View key={i} style={styles.actionRow}>
            <Text style={styles.actionDot}>{analysis.actions.length === 1 && action.includes('excellent') ? '✓' : '!'}</Text>
            <Text style={styles.actionText}>{action}</Text>
          </View>
        ))}
      </View>

      {/* 7 Laws Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>The 7 Laws of Wealth</Text>
        {analysis.lawData.map(law => (
          <View key={law.id} style={styles.lawItem}>
            <View style={styles.lawHeader}>
              <View style={[styles.lawDot, { backgroundColor: law.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lawTitle}>{law.title}</Text>
                <Text style={styles.lawStatus}>{law.status}</Text>
              </View>
              <Text style={[styles.lawPct, { color: law.color }]}>{law.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${law.progress}%`, backgroundColor: law.color }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  scoreCard: { alignItems: 'center', padding: 24, borderRadius: 12, backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, marginBottom: 12 },
  scoreLabel: { fontSize: 11, color: colors.gray500, letterSpacing: 1, fontWeight: '600' },
  scoreGrade: { fontSize: 52, fontWeight: '700', marginTop: 4 },
  scoreNum: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  wisdomCard: { padding: 20, borderRadius: 12, backgroundColor: colors.navy, marginBottom: 12 },
  wisdomLabel: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  wisdomText: { fontSize: 14, color: '#ffffffcc', fontStyle: 'italic', lineHeight: 22 },
  card: { padding: 16, borderRadius: 12, backgroundColor: colors.white, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, backgroundColor: colors.cream, borderRadius: 8, marginBottom: 6 },
  actionDot: { fontSize: 14, fontWeight: '700', color: colors.gold, width: 20 },
  actionText: { fontSize: 13, color: colors.gray700, flex: 1, lineHeight: 20 },
  lawItem: { marginBottom: 14 },
  lawHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  lawDot: { width: 10, height: 10, borderRadius: 5 },
  lawTitle: { fontSize: 13, fontWeight: '600', color: colors.gray800 },
  lawStatus: { fontSize: 11, color: colors.gray400, marginTop: 1 },
  lawPct: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 6, backgroundColor: colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});
