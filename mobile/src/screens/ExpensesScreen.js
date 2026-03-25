import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES } from '../data/babylonWisdom';
import { formatCurrency, formatDate, getCurrentMonth, sumByField } from '../utils/helpers';
import { colors, fonts } from '../theme';

export default function ExpensesScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: '', description: '', category: 'food', date: new Date().toISOString().split('T')[0] });
  const currency = state.settings.currency || 'USD';

  const currentMonth = getCurrentMonth();
  const totalExpenses = sumByField(state.expenses, 'amount');
  const monthlyExpenses = sumByField(state.expenses.filter(e => e.date?.startsWith(currentMonth)), 'amount');
  const monthlyIncome = sumByField(state.incomes.filter(i => i.date?.startsWith(currentMonth)), 'amount');
  const budget = monthlyIncome * (state.settings.livingRate / 100);
  const budgetPct = budget > 0 ? Math.min(100, (monthlyExpenses / budget) * 100) : 0;
  const remaining = budget - monthlyExpenses;

  function handleSave() {
    if (!form.amount || !form.description) return;
    dispatch({ type: 'ADD_EXPENSE', payload: { ...form, amount: Number(form.amount) } });
    setForm({ amount: '', description: '', category: 'food', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
  }

  const sorted = [...state.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={[styles.statValue, { color: colors.red }]}>{formatCurrency(totalExpenses, currency)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={[styles.statValue, { color: colors.red }]}>{formatCurrency(monthlyExpenses, currency)}</Text>
        </View>
      </View>

      {/* Budget Bar */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>Monthly Budget ({state.settings.livingRate}%)</Text>
          <View style={[styles.budgetBadge, { backgroundColor: budgetPct > 90 ? colors.red + '15' : colors.emerald + '15' }]}>
            <Text style={[styles.budgetPct, { color: budgetPct > 90 ? colors.red : colors.emerald }]}>{budgetPct.toFixed(0)}% used</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(budgetPct, 100)}%`, backgroundColor: budgetPct > 90 ? colors.red : budgetPct > 70 ? colors.orange : colors.emerald }]} />
        </View>
        <View style={styles.budgetFooter}>
          <Text style={styles.budgetSubtext}>{formatCurrency(monthlyExpenses, currency)} of {formatCurrency(budget, currency)}</Text>
          <Text style={[styles.budgetRemaining, { color: remaining >= 0 ? colors.emerald : colors.red }]}>
            {remaining >= 0 ? formatCurrency(remaining, currency) + ' left' : formatCurrency(Math.abs(remaining), currency) + ' over'}
          </Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptyText}>Track your spending to control your wealth</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = EXPENSE_CATEGORIES.find(c => c.id === item.category);
          return (
            <View style={styles.listItem}>
              <View style={[styles.catIcon, { backgroundColor: (cat?.color || colors.gray400) + '18' }]}>
                <Text style={[styles.catIconText, { color: cat?.color || colors.gray400 }]}>{(cat?.name || item.category).charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.description}</Text>
                <Text style={styles.itemDate}>{formatDate(item.date)} · {cat?.name || item.category}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>{formatCurrency(item.amount, currency)}</Text>
                <TouchableOpacity style={styles.deleteBtnWrap} onPress={() => dispatch({ type: 'DELETE_EXPENSE', payload: item.id })}>
                  <Text style={styles.deleteBtn}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Expense</Text>

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={styles.input} placeholder="What did you spend on?" placeholderTextColor={colors.gray300} value={form.description} onChangeText={v => setForm({ ...form, description: v })} />

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {EXPENSE_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, form.category === cat.id && { backgroundColor: cat.color + '18', borderColor: cat.color }]}
                  onPress={() => setForm({ ...form, category: cat.id })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.catChipText, form.category === cat.id && { color: cat.color, fontWeight: '700' }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.btnSaveText}>+ Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  statLabel: { ...fonts.statLabel },
  statValue: { ...fonts.statValue, marginTop: 4 },
  budgetCard: { marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: 16, backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  budgetTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  budgetBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  budgetPct: { fontSize: 12, fontWeight: '700' },
  progressBar: { height: 10, backgroundColor: colors.gray100, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  budgetSubtext: { fontSize: 12, color: colors.gray400 },
  budgetRemaining: { fontSize: 12, fontWeight: '700' },

  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, padding: 16, borderRadius: 14, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catIconText: { fontSize: 16, fontWeight: '700' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.gray800 },
  itemDate: { fontSize: 12, color: colors.gray400, marginTop: 3 },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 16, fontWeight: '700', color: colors.red },
  deleteBtnWrap: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.red + '10' },
  deleteBtn: { fontSize: 11, fontWeight: '600', color: colors.red },

  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.gray400, textAlign: 'center', paddingHorizontal: 40 },

  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
  },
  fabText: { fontSize: 30, color: colors.navy, fontWeight: '400', marginTop: -2 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 16, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, color: colors.gray800 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: colors.gray200, marginRight: 8, backgroundColor: colors.white },
  catChipText: { fontSize: 13, fontWeight: '500', color: colors.gray500 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 1, borderColor: colors.gray200 },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1.5, padding: 16, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', elevation: 3, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
