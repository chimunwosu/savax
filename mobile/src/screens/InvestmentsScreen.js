import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { INVESTMENT_TYPES } from '../data/babylonWisdom';
import { formatCurrency, formatDate, sumByField } from '../utils/helpers';
import { colors, fonts } from '../theme';

const emptyForm = { name: '', type: 'stocks', investedAmount: '', currentValue: '', date: new Date().toISOString().split('T')[0] };

export default function InvestmentsScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const currency = state.settings.currency || 'USD';

  const totalInvested = sumByField(state.investments, 'investedAmount');
  const totalCurrent = sumByField(state.investments, 'currentValue');
  const totalReturn = totalCurrent - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  function handleSave() {
    if (!form.name || !form.investedAmount) return;
    dispatch({
      type: 'ADD_INVESTMENT',
      payload: { ...form, investedAmount: Number(form.investedAmount), currentValue: Number(form.currentValue || form.investedAmount) },
    });
    setForm(emptyForm);
    setShowModal(false);
  }

  const sorted = [...state.investments].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Invested</Text>
          <Text style={[styles.statValue, { color: colors.blue }]}>{formatCurrency(totalInvested, currency)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current Value</Text>
          <Text style={[styles.statValue, { color: colors.gold }]}>{formatCurrency(totalCurrent, currency)}</Text>
        </View>
      </View>

      <View style={styles.returnCard}>
        <View style={[styles.returnIcon, { backgroundColor: totalReturn >= 0 ? colors.emerald + '15' : colors.red + '15' }]}>
          <Text style={{ color: totalReturn >= 0 ? colors.emerald : colors.red, fontSize: 18, fontWeight: '700' }}>
            {totalReturn >= 0 ? '%' : '!'}
          </Text>
        </View>
        <Text style={styles.returnLabel}>Total Returns</Text>
        <Text style={[styles.returnValue, { color: totalReturn >= 0 ? colors.emerald : colors.red }]}>
          {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn, currency)} ({returnPct.toFixed(1)}%)
        </Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No investments yet</Text>
            <Text style={styles.emptyText}>Put your money to work. Tap + to add an investment.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const ret = Number(item.currentValue) - Number(item.investedAmount);
          const pct = item.investedAmount > 0 ? (ret / item.investedAmount) * 100 : 0;
          const typeName = INVESTMENT_TYPES.find(t => t.id === item.type)?.name || item.type;
          const typeColor = INVESTMENT_TYPES.find(t => t.id === item.type)?.color || colors.gray400;
          return (
            <View style={styles.listItem}>
              <View style={[styles.typeIcon, { backgroundColor: typeColor + '18' }]}>
                <Text style={[styles.typeIconText, { color: typeColor }]}>{typeName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>{formatDate(item.date)} · {typeName}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>{formatCurrency(item.currentValue, currency)}</Text>
                <View style={[styles.returnBadge, { backgroundColor: ret >= 0 ? colors.emerald + '12' : colors.red + '12' }]}>
                  <Text style={[styles.itemReturn, { color: ret >= 0 ? colors.emerald : colors.red }]}>
                    {ret >= 0 ? '+' : ''}{pct.toFixed(1)}%
                  </Text>
                </View>
                <TouchableOpacity style={styles.deleteBtnWrap} onPress={() => dispatch({ type: 'DELETE_INVESTMENT', payload: item.id })}>
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
            <Text style={styles.modalTitle}>Add Investment</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput style={styles.input} placeholder="e.g., S&P 500 ETF" placeholderTextColor={colors.gray300} value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

            <Text style={styles.fieldLabel}>Amount Invested</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.investedAmount} onChangeText={v => setForm({ ...form, investedAmount: v })} />

            <Text style={styles.fieldLabel}>Current Value</Text>
            <TextInput style={styles.input} placeholder="Same as invested if new" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.currentValue} onChangeText={v => setForm({ ...form, currentValue: v })} />

            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {INVESTMENT_TYPES.map(t => (
                <TouchableOpacity key={t.id} style={[styles.typeChip, form.type === t.id && { backgroundColor: t.color + '18', borderColor: t.color }]} onPress={() => setForm({ ...form, type: t.id })} activeOpacity={0.7}>
                  <Text style={[styles.typeChipText, form.type === t.id && { color: t.color, fontWeight: '700' }]}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.btnSaveText}>+ Add Investment</Text>
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
  returnCard: { marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: 16, backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, alignItems: 'center' },
  returnIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  returnLabel: { fontSize: 11, color: colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  returnValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, padding: 16, borderRadius: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeIconText: { fontSize: 16, fontWeight: '700' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.gray800 },
  itemDate: { fontSize: 12, color: colors.gray400, marginTop: 3 },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 16, fontWeight: '700', color: colors.gold },
  returnBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 3 },
  itemReturn: { fontSize: 12, fontWeight: '700' },
  deleteBtnWrap: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.red + '10' },
  deleteBtn: { fontSize: 11, fontWeight: '600', color: colors.red },
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
  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: colors.gray200, marginRight: 8, backgroundColor: colors.white },
  typeChipText: { fontSize: 13, fontWeight: '500', color: colors.gray500 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 1, borderColor: colors.gray200 },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1.5, padding: 16, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', elevation: 3, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
