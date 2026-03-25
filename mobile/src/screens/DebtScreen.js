import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, calcDebtPayoff } from '../utils/helpers';
import { colors, fonts } from '../theme';

const emptyForm = { name: '', balance: '', interestRate: '', minPayment: '', extraPayment: '0' };

export default function DebtScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [strategy, setStrategy] = useState('avalanche');

  const totalDebt = state.debts.reduce((s, d) => s + Number(d.balance), 0);
  const totalPayments = state.debts.reduce((s, d) => s + Number(d.minPayment) + Number(d.extraPayment || 0), 0);

  const sortedDebts = [...state.debts].sort((a, b) =>
    strategy === 'avalanche'
      ? Number(b.interestRate) - Number(a.interestRate)
      : Number(a.balance) - Number(b.balance)
  );

  function handleSave() {
    if (!form.name || !form.balance || !form.minPayment) return;
    dispatch({
      type: 'ADD_DEBT',
      payload: {
        ...form,
        balance: Number(form.balance),
        interestRate: Number(form.interestRate),
        minPayment: Number(form.minPayment),
        extraPayment: Number(form.extraPayment || 0),
      },
    });
    setForm(emptyForm);
    setShowModal(false);
  }

  function formatMonths(m) {
    if (m === Infinity || m >= 600) return 'Never';
    const y = Math.floor(m / 12);
    const mo = m % 12;
    if (y > 0) return `${y}y ${mo}m`;
    return `${mo} months`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Debt</Text>
          <Text style={[styles.statValue, { color: colors.red }]}>{formatCurrency(totalDebt)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Monthly Payments</Text>
          <Text style={[styles.statValue, { color: colors.emerald }]}>{formatCurrency(totalPayments)}</Text>
        </View>
      </View>

      <View style={styles.strategyRow}>
        <TouchableOpacity style={[styles.stratBtn, strategy === 'avalanche' && styles.stratBtnActive]} onPress={() => setStrategy('avalanche')}>
          <Text style={[styles.stratText, strategy === 'avalanche' && styles.stratTextActive]}>Avalanche (High Rate)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.stratBtn, strategy === 'snowball' && styles.stratBtnActive]} onPress={() => setStrategy('snowball')}>
          <Text style={[styles.stratText, strategy === 'snowball' && styles.stratTextActive]}>Snowball (Low Balance)</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedDebts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No debts recorded</Text>
            <Text style={styles.emptyText}>Great! Stay debt-free, or add debts to track payoff.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const payment = Number(item.minPayment) + Number(item.extraPayment || 0);
          const result = calcDebtPayoff(Number(item.balance), Number(item.interestRate), payment);
          return (
            <View style={[styles.debtCard, index === 0 && { borderLeftColor: colors.gold }]}>
              <View style={styles.debtHeader}>
                <Text style={styles.debtName}>{item.name}</Text>
                {index === 0 && <Text style={styles.priorityBadge}>Priority</Text>}
              </View>
              <View style={styles.debtStats}>
                <View>
                  <Text style={styles.debtStatLabel}>Balance</Text>
                  <Text style={[styles.debtStatValue, { color: colors.red }]}>{formatCurrency(item.balance)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.debtStatLabel}>Rate</Text>
                  <Text style={styles.debtStatValue}>{item.interestRate}%</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.debtStatLabel}>Payoff</Text>
                  <Text style={[styles.debtStatValue, { color: colors.emerald }]}>{formatMonths(result.months)}</Text>
                </View>
              </View>
              <View style={styles.debtFooter}>
                <Text style={styles.debtPayment}>Payment: {formatCurrency(payment)}/mo</Text>
                <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_DEBT', payload: item.id })}>
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
            <Text style={styles.modalTitle}>Add Debt</Text>
            <TextInput style={styles.input} placeholder="Debt Name (e.g., Credit Card)" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <TextInput style={styles.input} placeholder="Balance" keyboardType="numeric" value={form.balance} onChangeText={v => setForm({ ...form, balance: v })} />
            <TextInput style={styles.input} placeholder="Interest Rate (%)" keyboardType="numeric" value={form.interestRate} onChangeText={v => setForm({ ...form, interestRate: v })} />
            <TextInput style={styles.input} placeholder="Minimum Payment" keyboardType="numeric" value={form.minPayment} onChangeText={v => setForm({ ...form, minPayment: v })} />
            <TextInput style={styles.input} placeholder="Extra Payment (optional)" keyboardType="numeric" value={form.extraPayment} onChangeText={v => setForm({ ...form, extraPayment: v })} />
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
  strategyRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 },
  stratBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: colors.gray100, alignItems: 'center' },
  stratBtnActive: { backgroundColor: colors.navy },
  stratText: { fontSize: 12, fontWeight: '600', color: colors.gray600 },
  stratTextActive: { color: colors.gold },
  debtCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: colors.gray200, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  debtName: { fontSize: 16, fontWeight: '700', color: colors.navy },
  priorityBadge: { fontSize: 10, fontWeight: '600', color: colors.gold, backgroundColor: colors.gold + '18', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  debtStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  debtStatLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase' },
  debtStatValue: { fontSize: 15, fontWeight: '700', marginTop: 2, color: colors.gray800 },
  debtFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  debtPayment: { fontSize: 12, color: colors.gray500 },
  deleteBtn: { fontSize: 12, color: colors.red },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.gray400, textAlign: 'center', paddingHorizontal: 40 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.goldDark, shadowOpacity: 0.3, shadowRadius: 8 },
  fabText: { fontSize: 28, color: colors.navy, fontWeight: '300', marginTop: -2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  input: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center' },
  btnCancelText: { fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center' },
  btnSaveText: { fontWeight: '600', color: colors.navy },
});
