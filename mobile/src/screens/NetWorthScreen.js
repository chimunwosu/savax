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
  const currency = state.settings.currency || 'USD';

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
          {formatCurrency(netWorth, currency)}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryBox, { borderLeftColor: colors.emerald }]}>
          <Text style={styles.summaryLabel}>Total Assets</Text>
          <Text style={[styles.summaryValue, { color: colors.emerald }]}>{formatCurrency(totalAssets, currency)}</Text>
        </View>
        <View style={[styles.summaryBox, { borderLeftColor: colors.red }]}>
          <Text style={styles.summaryLabel}>Total Liabilities</Text>
          <Text style={[styles.summaryValue, { color: colors.red }]}>{formatCurrency(totalLiabilities, currency)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assets</Text>
        {assetItems.length === 0 ? (
          <Text style={styles.emptyText}>No assets yet</Text>
        ) : assetItems.map((a, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={[styles.itemIcon, { backgroundColor: colors.emerald + '15' }]}>
              <Text style={{ color: colors.emerald, fontWeight: '700' }}>+</Text>
            </View>
            <Text style={[styles.itemName, { flex: 1 }]}>{a.name}</Text>
            <Text style={[styles.itemAmount, { color: colors.emerald }]}>{formatCurrency(a.amount, currency)}</Text>
            {a.id && (
              <TouchableOpacity style={styles.removeBtnWrap} onPress={() => dispatch({ type: 'DELETE_ASSET', payload: a.id })}>
                <Text style={styles.removeBtn}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Liabilities</Text>
        {liabilityItems.length === 0 ? (
          <Text style={styles.emptyText}>No liabilities</Text>
        ) : liabilityItems.map((l, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={[styles.itemIcon, { backgroundColor: colors.red + '15' }]}>
              <Text style={{ color: colors.red, fontWeight: '700' }}>-</Text>
            </View>
            <Text style={[styles.itemName, { flex: 1 }]}>{l.name}</Text>
            <Text style={[styles.itemAmount, { color: colors.red }]}>{formatCurrency(l.amount, currency)}</Text>
            {l.id && (
              <TouchableOpacity style={styles.removeBtnWrap} onPress={() => dispatch({ type: 'DELETE_ASSET', payload: l.id })}>
                <Text style={styles.removeBtn}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Text style={styles.addBtnText}>+ Add Asset or Liability</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Asset / Liability</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, form.type === 'asset' && styles.typeBtnActive]}
                onPress={() => setForm({ ...form, type: 'asset' })}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeText, form.type === 'asset' && styles.typeTextActive]}>Asset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, form.type === 'liability' && styles.typeBtnActiveRed]}
                onPress={() => setForm({ ...form, type: 'liability' })}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeText, form.type === 'liability' && styles.typeTextActive]}>Liability</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Home, Car Loan" placeholderTextColor={colors.gray300} value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.btnSaveText}>+ Add</Text>
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
  netWorthCard: { alignItems: 'center', padding: 28, borderRadius: 16, backgroundColor: colors.navy, marginBottom: 16, elevation: 4, shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  netWorthLabel: { fontSize: 12, color: colors.gold, letterSpacing: 1.5, fontWeight: '700' },
  netWorthValue: { fontSize: 36, fontWeight: '700', marginTop: 6 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryBox: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: colors.white, borderLeftWidth: 4, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  summaryLabel: { ...fonts.statLabel },
  summaryValue: { ...fonts.statValue, marginTop: 4 },
  card: { padding: 18, borderRadius: 16, backgroundColor: colors.white, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  itemIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.gray700 },
  itemAmount: { fontSize: 16, fontWeight: '700' },
  removeBtnWrap: { marginLeft: 8, width: 28, height: 28, borderRadius: 8, backgroundColor: colors.red + '12', alignItems: 'center', justifyContent: 'center' },
  removeBtn: { fontSize: 13, color: colors.red, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.gray400, paddingVertical: 16 },
  addBtn: { padding: 18, borderRadius: 14, backgroundColor: colors.gold + '15', alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: colors.gold + '30', borderStyle: 'dashed' },
  addBtnText: { fontSize: 15, fontWeight: '700', color: colors.gold },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  typeBtnActive: { backgroundColor: colors.emerald, borderColor: colors.emerald, elevation: 2 },
  typeBtnActiveRed: { backgroundColor: colors.red, borderColor: colors.red, elevation: 2 },
  typeText: { fontSize: 15, fontWeight: '700', color: colors.gray500 },
  typeTextActive: { color: colors.white },
  input: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, color: colors.gray800 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 1, borderColor: colors.gray200 },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1.5, padding: 16, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', elevation: 3, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
