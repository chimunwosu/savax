import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, sumByField } from '../utils/helpers';
import { getRandomWisdom } from '../data/babylonWisdom';
import { colors } from '../theme';

const MENU_ITEMS = [
  { label: 'Investments', screen: 'Investments', description: 'Track your portfolio', color: colors.blue },
  { label: 'Debt Payoff', screen: 'DebtPayoff', description: 'Eliminate debt strategically', color: colors.red },
  { label: 'Financial Reports', screen: 'Reports', description: 'Review your progress', color: colors.emerald },
  { label: 'Wealth Advisor', screen: 'Advisor', description: 'Personalized financial guidance', color: colors.purple },
  { label: 'Compound Calculator', screen: 'Calculator', description: 'Watch your money grow', color: colors.gold },
  { label: 'Net Worth', screen: 'NetWorth', description: 'Know your true wealth', color: colors.orange },
  { label: 'Settings', screen: 'Settings', description: 'Configure your preferences', color: colors.gray600 },
];

export default function MoreScreen({ navigation }) {
  const { state } = useApp();
  const totalIncome = sumByField(state.incomes, 'amount');
  const totalExpenses = sumByField(state.expenses, 'amount');
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  let score = 0;
  score += Math.min(25, savingsRate * 2.5);
  score += totalExpenses <= totalIncome * 0.7 ? 25 : 10;
  score += Math.min(20, totalIncome > 0 ? (sumByField(state.investments, 'investedAmount') / totalIncome) * 100 : 0);
  score += sumByField(state.debts, 'balance') === 0 ? 15 : 5;
  score += Math.min(15, state.goals.length > 0 ? 10 : 0);
  score = Math.round(Math.max(0, Math.min(100, score)));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  const gradeColor = score >= 75 ? colors.emerald : score >= 50 ? colors.gold : colors.red;

  const wisdom = getRandomWisdom();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Quick Score */}
      <View style={styles.scoreCard}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.scoreLabel}>HEALTH SCORE</Text>
          <Text style={[styles.scoreGrade, { color: gradeColor }]}>{grade}</Text>
          <Text style={[styles.scoreNum, { color: gradeColor }]}>{score}/100</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${score}%`, backgroundColor: gradeColor }]} />
        </View>
      </View>

      {/* Wisdom */}
      <View style={styles.wisdomCard}>
        <Text style={styles.wisdomLabel}>DAILY WISDOM</Text>
        <Text style={styles.wisdomText}>"{wisdom}"</Text>
      </View>

      {/* Menu */}
      {MENU_ITEMS.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={[styles.menuDot, { backgroundColor: item.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuDesc}>{item.description}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* About */}
      <View style={[styles.aboutCard, { borderLeftWidth: 4, borderLeftColor: colors.gold }]}>
        <Text style={styles.aboutTitle}>Savax v1.0</Text>
        <Text style={styles.aboutText}>
          Built on the timeless wealth principles from The Richest Man in Babylon by George S. Clason.
        </Text>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  scoreCard: { alignItems: 'center', padding: 20, borderRadius: 12, backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, marginBottom: 12 },
  scoreLabel: { fontSize: 11, color: colors.gray500, letterSpacing: 1, fontWeight: '600' },
  scoreGrade: { fontSize: 44, fontWeight: '700', marginTop: 2 },
  scoreNum: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  progressBar: { width: '100%', height: 6, backgroundColor: colors.gray100, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  wisdomCard: { padding: 20, borderRadius: 12, backgroundColor: colors.navy, marginBottom: 16 },
  wisdomLabel: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  wisdomText: { fontSize: 14, color: '#ffffffcc', fontStyle: 'italic', lineHeight: 22 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, padding: 16, borderRadius: 12, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
  },
  menuDot: { width: 12, height: 12, borderRadius: 6 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: colors.gray800 },
  menuDesc: { fontSize: 12, color: colors.gray400, marginTop: 1 },
  menuArrow: { fontSize: 24, color: colors.gray300, fontWeight: '300' },
  aboutCard: { padding: 16, borderRadius: 12, backgroundColor: colors.white, marginTop: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  aboutTitle: { fontSize: 14, fontWeight: '700', color: colors.gold, marginBottom: 4 },
  aboutText: { fontSize: 12, color: colors.gray500, lineHeight: 18 },
});
