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

  const currentMonth = getCurrentMonth();
  const totalExpenses = sumByField(state.expenses, 'amount');
  const monthlyExpenses = sumByField(state.expenses.filter(e => e.date?.startsWith(currentMonth)), 'amount');
  const monthlyIncome = sumByField(state.incomes.filter(i => i.date?.startsWith(currentMonth)), 'amount');
  const budget = monthlyIncome * (state.settings.livingRate / 100);
  const budgetPct = budget > 0 ? Math.min(100, (monthlyExpenses / budget) * 100) : 0;

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
          <Text style={[styles.statValue, { color: colors.red }]}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={[styles.statValue, { color: colors.red }]}>{formatCurrency(monthlyExpenses)}</Text>
        </View>
      </View>

      {/* Budget Bar */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>Budget ({state.settings.livingRate}%)</Text>
          <Text style={[styles.budgetPct, { color: budgetPct > 100 ? colors.red : colors.emerald }]}>{budgetPct.toFixed(0)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(budgetPct, 100)}%`, backgroundColor: budgetPct > 100 ? colors.red : colors.emerald }]} />
        </View>
        <Text style={styles.budgetSubtext}>{formatCurrency(monthlyExpenses)} / {formatCurrency(budget)}</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet. Tap + to add.</Text>}
        renderItem={({ item }) => {
          const cat = EXPENSE_CATEGORIES.find(c => c.id === item.category);
          return (
            <View style={styles.listItem}>
              <View style={[styles.catDot, { backgroundColor: cat?.color || colors.gray400 }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.description}</Text>
                <Text style={styles.itemDate}>{formatDate(item.date)} - {cat?.name || item.category}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_EXPENSE', payload: item.id })}>
                  <Text style={styles.deleteBtn}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />
            <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={v => setForm({ ...form, description: v })} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.gray700, marginBottom: 8 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {EXPENSE_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, form.category === cat.id && { backgroundColor: cat.color + '22', borderColor: cat.color }]}
                  onPress={() => setForm({ ...form, category: cat.id })}
                >
                  <Text style={[styles.catChipText, form.category === cat.id && { color: cat.color, fontWeight: '600' }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnSaveText}>Add</Text>
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
  statBox: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  statLabel: { ...fonts.statLabel },
  statValue: { ...fonts.statValue, marginTop: 4 },
  budgetCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  budgetTitle: { fontSize: 13, fontWeight: '600', color: colors.navy },
  budgetPct: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  budgetSubtext: { fontSize: 11, color: colors.gray400, marginTop: 4 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, padding: 14, borderRadius: 10, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
  },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.gray800 },
  itemDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 15, fontWeight: '700', color: colors.red },
  deleteBtn: { fontSize: 11, color: colors.red, marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.gray400, paddingVertical: 40 },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: colors.goldDark, shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: colors.navy, fontWeight: '300', marginTop: -2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  input: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.gray200, marginRight: 8 },
  catChipText: { fontSize: 12, color: colors.gray600 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center' },
  btnCancelText: { fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center' },
  btnSaveText: { fontWeight: '600', color: colors.navy },
});
