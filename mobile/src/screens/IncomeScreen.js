import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getCurrentMonth, sumByField } from '../utils/helpers';
import { colors, fonts } from '../theme';

const TYPES = ['Salary', 'Freelance', 'Business', 'Passive', 'Other'];
const INCOME_SOURCES = ['Employment Salary', 'Freelance/Contract', 'Business Revenue', 'Rental Income', 'Investment Returns', 'Side Hustle', 'Other'];

export default function IncomeScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: '', source: '', customSource: '', type: 'Salary', date: new Date().toISOString().split('T')[0] });

  const currentMonth = getCurrentMonth();
  const totalIncome = sumByField(state.incomes, 'amount');
  const monthlyIncome = sumByField(state.incomes.filter(i => i.date?.startsWith(currentMonth)), 'amount');

  function handleSave() {
    const finalSource = form.source === 'Other' ? form.customSource : form.source;
    if (!form.amount || !finalSource) return;
    dispatch({ type: 'ADD_INCOME', payload: { ...form, source: finalSource, amount: Number(form.amount) } });
    setForm({ amount: '', source: '', customSource: '', type: 'Salary', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
  }

  const sorted = [...state.incomes].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Income</Text>
          <Text style={[styles.statValue, { color: colors.gold }]}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={[styles.statValue, { color: colors.emerald }]}>{formatCurrency(monthlyIncome)}</Text>
        </View>
      </View>

      {/* Split Bar */}
      <View style={styles.splitCard}>
        <Text style={styles.splitTitle}>Babylon Split</Text>
        <View style={styles.splitRow}>
          <View style={[styles.splitSegment, { backgroundColor: colors.emerald, flex: state.settings.savingsRate }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.blue, flex: state.settings.investmentRate }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.orange, flex: state.settings.livingRate }]} />
        </View>
        <View style={styles.splitLabels}>
          <Text style={styles.splitLabel}>Save {state.settings.savingsRate}%</Text>
          <Text style={styles.splitLabel}>Invest {state.settings.investmentRate}%</Text>
          <Text style={styles.splitLabel}>Live {state.settings.livingRate}%</Text>
        </View>
      </View>

      {/* Income List */}
      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No income recorded yet. Tap + to add.</Text>}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.itemName}>{item.source}</Text>
              <Text style={styles.itemDate}>{formatDate(item.date)} - {item.type}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
              <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_INCOME', payload: item.id })}>
                <Text style={styles.deleteBtn}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Income</Text>
            <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.gray700, marginBottom: 8 }}>Source</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {INCOME_SOURCES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sourceChip, form.source === s && styles.sourceChipActive]}
                  onPress={() => setForm({ ...form, source: s, customSource: '' })}
                >
                  <Text style={[styles.sourceChipText, form.source === s && styles.sourceChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {form.source === 'Other' && (
              <TextInput style={styles.input} placeholder="Enter your income source" value={form.customSource} onChangeText={v => setForm({ ...form, customSource: v })} />
            )}
            <View style={styles.typeRow}>
              {TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, form.type === t && styles.typeChipActive]} onPress={() => setForm({ ...form, type: t })}>
                  <Text style={[styles.typeChipText, form.type === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  splitCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  splitTitle: { fontSize: 13, fontWeight: '600', color: colors.navy, marginBottom: 8 },
  splitRow: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  splitSegment: { height: '100%' },
  splitLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  splitLabel: { fontSize: 11, color: colors.gray500 },
  listItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, padding: 16, borderRadius: 10, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.gray800 },
  itemDate: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 16, fontWeight: '700', color: colors.emerald },
  deleteBtn: { fontSize: 11, color: colors.red, marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.gray400, paddingVertical: 40 },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: colors.goldDark, shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: colors.navy, fontWeight: '300', marginTop: -2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  input: { backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  sourceChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.gray200, marginRight: 8 },
  sourceChipActive: { backgroundColor: colors.gold + '22', borderColor: colors.gold },
  sourceChipText: { fontSize: 12, color: colors.gray600 },
  sourceChipTextActive: { color: colors.navy, fontWeight: '600' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray100 },
  typeChipActive: { backgroundColor: colors.gold },
  typeChipText: { fontSize: 12, color: colors.gray600 },
  typeChipTextActive: { color: colors.navy, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center' },
  btnCancelText: { fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center' },
  btnSaveText: { fontWeight: '600', color: colors.navy },
});
