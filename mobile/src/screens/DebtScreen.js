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
  const currency = state.settings.currency || 'USD';

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
          <Text style={[styles.statValue, { color: colors.red }]}>{formatCurrency(totalDebt, currency)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Monthly Payments</Text>
          <Text style={[styles.statValue, { color: colors.emerald }]}>{formatCurrency(totalPayments, currency)}</Text>
        </View>
      </View>

      <View style={styles.strategyRow}>
        <TouchableOpacity
          style={[styles.stratBtn, strategy === 'avalanche' && styles.stratBtnActive]}
          onPress={() => setStrategy('avalanche')}
          activeOpacity={0.7}
        >
          <Text style={[styles.stratText, strategy === 'avalanche' && styles.stratTextActive]}>Avalanche</Text>
          <Text style={[styles.stratDesc, strategy === 'avalanche' && styles.stratDescActive]}>High Rate First</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.stratBtn, strategy === 'snowball' && styles.stratBtnActive]}
          onPress={() => setStrategy('snowball')}
          activeOpacity={0.7}
        >
          <Text style={[styles.stratText, strategy === 'snowball' && styles.stratTextActive]}>Snowball</Text>
          <Text style={[styles.stratDesc, strategy === 'snowball' && styles.stratDescActive]}>Low Balance First</Text>
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
                {index === 0 && (
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>Priority</Text>
                  </View>
                )}
              </View>
              <View style={styles.debtStats}>
                <View>
                  <Text style={styles.debtStatLabel}>Balance</Text>
                  <Text style={[styles.debtStatValue, { color: colors.red }]}>{formatCurrency(item.balance, currency)}</Text>
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
                <Text style={styles.debtPayment}>Payment: {formatCurrency(payment, currency)}/mo</Text>
                <TouchableOpacity style={styles.deleteBtnWrap} onPress={() => dispatch({ type: 'DELETE_DEBT', payload: item.id })}>
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
            <Text style={styles.modalTitle}>Add Debt</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Credit Card" placeholderTextColor={colors.gray300} value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

            <Text style={styles.fieldLabel}>Balance</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.balance} onChangeText={v => setForm({ ...form, balance: v })} />

            <Text style={styles.fieldLabel}>Interest Rate (%)</Text>
            <TextInput style={styles.input} placeholder="0.0" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.interestRate} onChangeText={v => setForm({ ...form, interestRate: v })} />

            <Text style={styles.fieldLabel}>Minimum Payment</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.minPayment} onChangeText={v => setForm({ ...form, minPayment: v })} />

            <Text style={styles.fieldLabel}>Extra Payment (optional)</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.extraPayment} onChangeText={v => setForm({ ...form, extraPayment: v })} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.btnSaveText}>+ Add Debt</Text>
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

  strategyRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 10 },
  stratBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, borderWidth: 2, borderColor: 'transparent' },
  stratBtnActive: { backgroundColor: colors.navy, borderColor: colors.gold, elevation: 4 },
  stratText: { fontSize: 14, fontWeight: '700', color: colors.gray600 },
  stratTextActive: { color: colors.gold },
  stratDesc: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  stratDescActive: { color: colors.gold + 'aa' },

  debtCard: { backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: colors.gray200, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  debtName: { fontSize: 17, fontWeight: '700', color: colors.navy },
  priorityBadge: { backgroundColor: colors.gold + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 11, fontWeight: '700', color: colors.gold },
  debtStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  debtStatLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase', fontWeight: '600' },
  debtStatValue: { fontSize: 16, fontWeight: '700', marginTop: 2, color: colors.gray800 },
  debtFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  debtPayment: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  deleteBtnWrap: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.red + '10' },
  deleteBtn: { fontSize: 12, fontWeight: '600', color: colors.red },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.gray400, textAlign: 'center', paddingHorizontal: 40 },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
  fabText: { fontSize: 30, color: colors.navy, fontWeight: '400', marginTop: -2 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 16, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, color: colors.gray800 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 1, borderColor: colors.gray200 },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1.5, padding: 16, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', elevation: 3, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
