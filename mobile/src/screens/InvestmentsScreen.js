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
          <Text style={[styles.statValue, { color: colors.blue }]}>{formatCurrency(totalInvested)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current Value</Text>
          <Text style={[styles.statValue, { color: colors.gold }]}>{formatCurrency(totalCurrent)}</Text>
        </View>
      </View>

      <View style={styles.returnCard}>
        <Text style={styles.returnLabel}>Total Returns</Text>
        <Text style={[styles.returnValue, { color: totalReturn >= 0 ? colors.emerald : colors.red }]}>
          {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)} ({returnPct.toFixed(1)}%)
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
              <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>{formatDate(item.date)} · {typeName}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>{formatCurrency(item.currentValue)}</Text>
                <Text style={[styles.itemReturn, { color: ret >= 0 ? colors.emerald : colors.red }]}>
                  {ret >= 0 ? '+' : ''}{pct.toFixed(1)}%
                </Text>
                <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_INVESTMENT', payload: item.id })}>
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
            <Text style={styles.modalTitle}>Add Investment</Text>
            <TextInput style={styles.input} placeholder="Investment Name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <TextInput style={styles.input} placeholder="Amount Invested" keyboardType="numeric" value={form.investedAmount} onChangeText={v => setForm({ ...form, investedAmount: v })} />
            <TextInput style={styles.input} placeholder="Current Value" keyboardType="numeric" value={form.currentValue} onChangeText={v => setForm({ ...form, currentValue: v })} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.gray700, marginBottom: 8 }}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {INVESTMENT_TYPES.map(t => (
                <TouchableOpacity key={t.id} style={[styles.typeChip, form.type === t.id && { backgroundColor: t.color + '22', borderColor: t.color }]} onPress={() => setForm({ ...form, type: t.id })}>
                  <Text style={[styles.typeChipText, form.type === t.id && { color: t.color, fontWeight: '600' }]}>{t.name}</Text>
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
  returnCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, alignItems: 'center' },
  returnLabel: { fontSize: 11, color: colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  returnValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.gray800 },
  itemDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 15, fontWeight: '700', color: colors.gold },
  itemReturn: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  deleteBtn: { fontSize: 11, color: colors.red, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.gray400 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.goldDark, shadowOpacity: 0.3, shadowRadius: 8 },
  fabText: { fontSize: 28, color: colors.navy, fontWeight: '300', marginTop: -2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  input: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.gray200, marginRight: 8 },
  typeChipText: { fontSize: 12, color: colors.gray600 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center' },
  btnCancelText: { fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center' },
  btnSaveText: { fontWeight: '600', color: colors.navy },
});
