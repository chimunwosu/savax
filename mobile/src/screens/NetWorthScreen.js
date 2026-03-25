import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, sumByField } from '../utils/helpers';
import { colors, fonts } from '../theme';

const emptyForm = { name: '', amount: '', type: 'asset', category: 'cash' };

export default function NetWorthScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { totalAssets, totalLiabilities, netWorth, assetItems, liabilityItems } = useMemo(() => {
    const investmentValue = sumByField(state.investments, 'currentValue');
    const goalsSaved = state.goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    const customAssets = state.assets.filter(a => a.type === 'asset');
    const customLiabilities = state.assets.filter(a => a.type === 'liability');
    const debtTotal = sumByField(state.debts, 'balance');

    const assetItems = [];
    if (investmentValue > 0) assetItems.push({ name: 'Investments', amount: investmentValue });
    if (goalsSaved > 0) assetItems.push({ name: 'Savings Goals', amount: goalsSaved });
    customAssets.forEach(a => assetItems.push({ name: a.name, amount: Number(a.amount), id: a.id }));

    const liabilityItems = [];
    if (debtTotal > 0) liabilityItems.push({ name: 'Total Debts', amount: debtTotal });
    customLiabilities.forEach(l => liabilityItems.push({ name: l.name, amount: Number(l.amount), id: l.id }));

    const totalAssets = assetItems.reduce((s, a) => s + a.amount, 0);
    const totalLiabilities = liabilityItems.reduce((s, l) => s + l.amount, 0);

    return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities, assetItems, liabilityItems };
  }, [state]);

  function handleSave() {
    if (!form.name || !form.amount) return;
    dispatch({ type: 'ADD_ASSET', payload: { ...form, amount: Number(form.amount) } });
    setShowModal(false);
    setForm(emptyForm);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>NET WORTH</Text>
        <Text style={[styles.netWorthValue, { color: netWorth >= 0 ? colors.gold : colors.red }]}>
          {formatCurrency(netWorth)}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryBox, { borderLeftColor: colors.emerald }]}>
          <Text style={styles.summaryLabel}>Total Assets</Text>
          <Text style={[styles.summaryValue, { color: colors.emerald }]}>{formatCurrency(totalAssets)}</Text>
        </View>
        <View style={[styles.summaryBox, { borderLeftColor: colors.red }]}>
          <Text style={styles.summaryLabel}>Total Liabilities</Text>
          <Text style={[styles.summaryValue, { color: colors.red }]}>{formatCurrency(totalLiabilities)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assets</Text>
        {assetItems.length === 0 ? (
          <Text style={styles.emptyText}>No assets yet</Text>
        ) : assetItems.map((a, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{a.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={[styles.itemAmount, { color: colors.emerald }]}>{formatCurrency(a.amount)}</Text>
              {a.id && (
                <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_ASSET', payload: a.id })}>
                  <Text style={styles.deleteBtn}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Liabilities</Text>
        {liabilityItems.length === 0 ? (
          <Text style={styles.emptyText}>No liabilities</Text>
        ) : liabilityItems.map((l, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{l.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={[styles.itemAmount, { color: colors.red }]}>{formatCurrency(l.amount)}</Text>
              {l.id && (
                <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_ASSET', payload: l.id })}>
                  <Text style={styles.deleteBtn}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.addBtnText}>+ Add Asset or Liability</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Asset / Liability</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeBtn, form.type === 'asset' && styles.typeBtnActive]} onPress={() => setForm({ ...form, type: 'asset' })}>
                <Text style={[styles.typeText, form.type === 'asset' && styles.typeTextActive]}>Asset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, form.type === 'liability' && styles.typeBtnActiveRed]} onPress={() => setForm({ ...form, type: 'liability' })}>
                <Text style={[styles.typeText, form.type === 'liability' && styles.typeTextActive]}>Liability</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />
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

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  netWorthCard: { alignItems: 'center', padding: 24, borderRadius: 12, backgroundColor: colors.navy, marginBottom: 16 },
  netWorthLabel: { fontSize: 11, color: colors.gold, letterSpacing: 1, fontWeight: '600' },
  netWorthValue: { fontSize: 34, fontWeight: '700', marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryBox: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.white, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  summaryLabel: { ...fonts.statLabel },
  summaryValue: { ...fonts.statValue, marginTop: 4 },
  card: { padding: 16, borderRadius: 12, backgroundColor: colors.white, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  itemName: { fontSize: 14, fontWeight: '500', color: colors.gray700 },
  itemAmount: { fontSize: 15, fontWeight: '700' },
  deleteBtn: { fontSize: 14, color: colors.red, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.gray400, paddingVertical: 16 },
  addBtn: { padding: 16, borderRadius: 12, backgroundColor: colors.gold + '18', alignItems: 'center', marginBottom: 16 },
  addBtnText: { fontSize: 14, fontWeight: '600', color: colors.gold },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center' },
  typeBtnActive: { backgroundColor: colors.emerald },
  typeBtnActiveRed: { backgroundColor: colors.red },
  typeText: { fontWeight: '600', color: colors.gray600 },
  typeTextActive: { color: colors.white },
  input: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center' },
  btnCancelText: { fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center' },
  btnSaveText: { fontWeight: '600', color: colors.navy },
});
