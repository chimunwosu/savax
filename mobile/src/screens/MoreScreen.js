import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatCurrency, sumByField } from '../utils/helpers';
import { getRandomWisdom } from '../data/babylonWisdom';
import { colors } from '../theme';

const MENU_ITEMS = [
  { label: 'Investments', screen: 'Investments', description: 'Track your portfolio', color: colors.blue, icon: 'trending-up-outline' },
  { label: 'Debt Payoff', screen: 'DebtPayoff', description: 'Eliminate debt strategically', color: colors.red, icon: 'shield-checkmark-outline' },
  { label: 'Financial Reports', screen: 'Reports', description: 'Review your progress', color: colors.emerald, icon: 'bar-chart-outline' },
  { label: 'Wealth Advisor', screen: 'Advisor', description: 'Personalized financial guidance', color: colors.purple, icon: 'bulb-outline' },
  { label: 'Compound Calculator', screen: 'Calculator', description: 'Watch your money grow', color: colors.gold, icon: 'calculator-outline' },
  { label: 'Net Worth', screen: 'NetWorth', description: 'Know your true wealth', color: colors.orange, icon: 'diamond-outline' },
  { label: 'Settings', screen: 'Settings', description: 'Configure your preferences', color: colors.gray600, icon: 'settings-outline' },
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
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuDesc}>{item.description}</Text>
          </View>
          <View style={styles.menuArrowWrap}>
            <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
          </View>
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
  scoreCard: { alignItems: 'center', padding: 24, borderRadius: 16, backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, marginBottom: 12 },
  scoreLabel: { fontSize: 12, color: colors.gray500, letterSpacing: 1.5, fontWeight: '700' },
  scoreGrade: { fontSize: 48, fontWeight: '700', marginTop: 4 },
  scoreNum: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  progressBar: { width: '100%', height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  wisdomCard: { padding: 20, borderRadius: 16, backgroundColor: colors.navy, marginBottom: 16, elevation: 4, shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  wisdomLabel: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  wisdomText: { fontSize: 14, color: '#ffffffcc', fontStyle: 'italic', lineHeight: 22 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, padding: 16, borderRadius: 16, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  menuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuIconText: { fontSize: 18, fontWeight: '700' },
  menuLabel: { fontSize: 16, fontWeight: '700', color: colors.gray800 },
  menuDesc: { fontSize: 12, color: colors.gray400, marginTop: 2 },
  menuArrowWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  menuArrow: { fontSize: 20, color: colors.gray400, fontWeight: '500', marginTop: -2 },
  aboutCard: { padding: 18, borderRadius: 16, backgroundColor: colors.white, marginTop: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  aboutTitle: { fontSize: 14, fontWeight: '700', color: colors.gold, marginBottom: 4 },
  aboutText: { fontSize: 12, color: colors.gray500, lineHeight: 18 },
});
