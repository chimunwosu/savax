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
  const currency = state.settings.currency || 'USD';

  const currentMonth = getCurrentMonth();
  const totalIncome = sumByField(state.incomes, 'amount');
  const monthlyIncome = sumByField(state.incomes.filter(i => i.date?.startsWith(currentMonth)), 'amount');

  // Babylon Split amounts
  const savingsAmount = monthlyIncome * (state.settings.savingsRate / 100);
  const investAmount = monthlyIncome * (state.settings.investmentRate / 100);
  const livingAmount = monthlyIncome * (state.settings.livingRate / 100);

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
          <Text style={[styles.statValue, { color: colors.gold }]}>{formatCurrency(totalIncome, currency)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={[styles.statValue, { color: colors.emerald }]}>{formatCurrency(monthlyIncome, currency)}</Text>
        </View>
      </View>

      {/* Split Card with Amounts */}
      <View style={styles.splitCard}>
        <Text style={styles.splitTitle}>The Babylon Split</Text>
        <View style={styles.splitRow}>
          <View style={[styles.splitSegment, { backgroundColor: colors.emerald, flex: state.settings.savingsRate || 1 }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.blue, flex: state.settings.investmentRate || 1 }]} />
          <View style={[styles.splitSegment, { backgroundColor: colors.orange, flex: state.settings.livingRate || 1 }]} />
        </View>
        <View style={styles.splitDetails}>
          <View style={styles.splitItem}>
            <View style={styles.splitItemHeader}>
              <View style={[styles.splitDot, { backgroundColor: colors.emerald }]} />
              <Text style={styles.splitItemLabel}>Save</Text>
              <View style={styles.splitPctBadge}>
                <Text style={styles.splitPctText}>{state.settings.savingsRate}%</Text>
              </View>
            </View>
            <Text style={[styles.splitItemAmount, { color: colors.emerald }]}>{formatCurrency(savingsAmount, currency)}<Text style={styles.perMonth}>/mo</Text></Text>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <View style={styles.splitItemHeader}>
              <View style={[styles.splitDot, { backgroundColor: colors.blue }]} />
              <Text style={styles.splitItemLabel}>Invest</Text>
              <View style={styles.splitPctBadge}>
                <Text style={styles.splitPctText}>{state.settings.investmentRate}%</Text>
              </View>
            </View>
            <Text style={[styles.splitItemAmount, { color: colors.blue }]}>{formatCurrency(investAmount, currency)}<Text style={styles.perMonth}>/mo</Text></Text>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <View style={styles.splitItemHeader}>
              <View style={[styles.splitDot, { backgroundColor: colors.orange }]} />
              <Text style={styles.splitItemLabel}>Live</Text>
              <View style={styles.splitPctBadge}>
                <Text style={styles.splitPctText}>{state.settings.livingRate}%</Text>
              </View>
            </View>
            <Text style={[styles.splitItemAmount, { color: colors.orange }]}>{formatCurrency(livingAmount, currency)}<Text style={styles.perMonth}>/mo</Text></Text>
          </View>
        </View>
      </View>

      {/* Income List */}
      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>+</Text>
            <Text style={styles.emptyTitle}>No income recorded yet</Text>
            <Text style={styles.emptyText}>Tap the button below to add your first income</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemIcon}>
              <Text style={styles.listItemIconText}>{item.source?.charAt(0) || '$'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.source}</Text>
              <Text style={styles.itemDate}>{formatDate(item.date)} · {item.type}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemAmount}>{formatCurrency(item.amount, currency)}</Text>
              <TouchableOpacity style={styles.deleteBtnWrap} onPress={() => dispatch({ type: 'DELETE_INCOME', payload: item.id })}>
                <Text style={styles.deleteBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Income</Text>

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />

            <Text style={styles.fieldLabel}>Source</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {INCOME_SOURCES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sourceChip, form.source === s && styles.sourceChipActive]}
                  onPress={() => setForm({ ...form, source: s, customSource: '' })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sourceChipText, form.source === s && styles.sourceChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {form.source === 'Other' && (
              <>
                <Text style={styles.fieldLabel}>Specify Source</Text>
                <TextInput style={styles.input} placeholder="Enter your income source" placeholderTextColor={colors.gray300} value={form.customSource} onChangeText={v => setForm({ ...form, customSource: v })} />
              </>
            )}

            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, form.type === t && styles.typeChipActive]} onPress={() => setForm({ ...form, type: t })} activeOpacity={0.7}>
                  <Text style={[styles.typeChipText, form.type === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.btnSaveText}>+ Add Income</Text>
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

  // Split Card
  splitCard: { marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 16, backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  splitTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  splitRow: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 16 },
  splitSegment: { height: '100%' },
  splitDetails: { gap: 0 },
  splitItem: { paddingVertical: 10 },
  splitItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  splitDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  splitItemLabel: { fontSize: 14, fontWeight: '600', color: colors.gray700, flex: 1 },
  splitPctBadge: { backgroundColor: colors.gray100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  splitPctText: { fontSize: 11, fontWeight: '700', color: colors.gray600 },
  splitItemAmount: { fontSize: 18, fontWeight: '700', marginLeft: 18 },
  perMonth: { fontSize: 12, fontWeight: '400', color: colors.gray400 },
  splitDivider: { height: 1, backgroundColor: colors.gray100, marginLeft: 18 },

  // List Items
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, padding: 16, borderRadius: 14, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  listItemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.gold + '20', alignItems: 'center', justifyContent: 'center' },
  listItemIconText: { fontSize: 16, fontWeight: '700', color: colors.gold },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.gray800 },
  itemDate: { fontSize: 12, color: colors.gray400, marginTop: 3 },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 17, fontWeight: '700', color: colors.emerald },
  deleteBtnWrap: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.red + '10' },
  deleteBtn: { fontSize: 11, fontWeight: '600', color: colors.red },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyIcon: { fontSize: 40, color: colors.gray200, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.gray400, textAlign: 'center', paddingHorizontal: 40 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
  },
  fabText: { fontSize: 30, color: colors.navy, fontWeight: '400', marginTop: -2 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, color: colors.gray800 },

  // Source Chips
  sourceChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: colors.gray200, marginRight: 8, backgroundColor: colors.white },
  sourceChipActive: { backgroundColor: colors.gold + '18', borderColor: colors.gold },
  sourceChipText: { fontSize: 13, fontWeight: '500', color: colors.gray500 },
  sourceChipTextActive: { color: colors.navy, fontWeight: '700' },

  // Type Chips
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: colors.gray100, borderWidth: 1.5, borderColor: 'transparent' },
  typeChipActive: { backgroundColor: colors.gold + '18', borderColor: colors.gold },
  typeChipText: { fontSize: 13, fontWeight: '500', color: colors.gray500 },
  typeChipTextActive: { color: colors.navy, fontWeight: '700' },

  // Actions
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 1, borderColor: colors.gray200 },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1.5, padding: 16, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', elevation: 3, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
