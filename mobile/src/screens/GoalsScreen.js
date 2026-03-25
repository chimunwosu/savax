import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { colors, fonts } from '../theme';

const CATEGORIES = ['emergency', 'vacation', 'home', 'car', 'education', 'retirement', 'other'];

export default function GoalsScreen() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showFund, setShowFund] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '0', category: 'emergency' });
  const currency = state.settings.currency || 'USD';

  function handleSave() {
    if (!form.name || !form.targetAmount) return;
    dispatch({ type: 'ADD_GOAL', payload: { ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount || 0) } });
    setForm({ name: '', targetAmount: '', currentAmount: '0', category: 'emergency' });
    setShowModal(false);
  }

  function handleFund() {
    if (!fundAmount || !showFund) return;
    dispatch({ type: 'UPDATE_GOAL', payload: { ...showFund, currentAmount: showFund.currentAmount + Number(fundAmount) } });
    setShowFund(null);
    setFundAmount('');
  }

  function getProgress(g) { return g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0; }
  function getColor(pct) { return pct >= 100 ? colors.emerald : pct >= 50 ? colors.gold : colors.blue; }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {state.goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No savings goals yet</Text>
            <Text style={styles.emptyText}>Set a goal to stay motivated on your journey</Text>
          </View>
        ) : (
          state.goals.map(goal => {
            const pct = getProgress(goal);
            const color = getColor(pct);
            return (
              <View key={goal.id} style={[styles.goalCard, { borderLeftColor: color }]}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  {pct >= 100 && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Completed!</Text>
                    </View>
                  )}
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <View style={styles.goalStats}>
                  <View>
                    <Text style={styles.goalStatLabel}>Saved</Text>
                    <Text style={[styles.goalStatValue, { color: colors.emerald }]}>{formatCurrency(goal.currentAmount, currency)}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.goalStatLabel}>Progress</Text>
                    <Text style={[styles.goalStatValue, { color }]}>{pct.toFixed(0)}%</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.goalStatLabel}>Target</Text>
                    <Text style={[styles.goalStatValue, { color: colors.gold }]}>{formatCurrency(goal.targetAmount, currency)}</Text>
                  </View>
                </View>
                <View style={styles.goalActions}>
                  <TouchableOpacity style={styles.fundBtn} onPress={() => { setShowFund(goal); setFundAmount(''); }} activeOpacity={0.7}>
                    <Text style={styles.fundBtnText}>+ Add Funds</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtnWrap} onPress={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })} activeOpacity={0.7}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Savings Goal</Text>

            <Text style={styles.fieldLabel}>Goal Name</Text>
            <TextInput style={styles.input} placeholder="e.g., Emergency Fund" placeholderTextColor={colors.gray300} value={form.name} onChangeText={v => setForm({ ...form, name: v })} />

            <Text style={styles.fieldLabel}>Target Amount</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.targetAmount} onChangeText={v => setForm({ ...form, targetAmount: v })} />

            <Text style={styles.fieldLabel}>Starting Amount (optional)</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={form.currentAmount} onChangeText={v => setForm({ ...form, currentAmount: v })} />

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.catChip, form.category === c && styles.catChipActive]} onPress={() => setForm({ ...form, category: c })} activeOpacity={0.7}>
                  <Text style={[styles.catChipText, form.category === c && styles.catChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.btnSaveText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fund Modal */}
      <Modal visible={!!showFund} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Funds to {showFund?.name}</Text>

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={colors.gray300} keyboardType="numeric" value={fundAmount} onChangeText={setFundAmount} autoFocus />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowFund(null)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleFund} activeOpacity={0.8}>
                <Text style={styles.btnSaveText}>+ Add Funds</Text>
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
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.gray400 },
  goalCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 14,
    borderLeftWidth: 4, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalName: { fontSize: 17, fontWeight: '700', color: colors.navy },
  completedBadge: { backgroundColor: colors.emerald + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  completedText: { fontSize: 11, fontWeight: '700', color: colors.emerald },
  progressBar: { height: 10, backgroundColor: colors.gray100, borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 5 },
  goalStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  goalStatLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase', fontWeight: '600' },
  goalStatValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  goalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fundBtn: { backgroundColor: colors.emerald + '12', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.emerald + '30' },
  fundBtnText: { fontSize: 14, fontWeight: '700', color: colors.emerald },
  deleteBtnWrap: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.red + '10' },
  deleteBtn: { fontSize: 13, fontWeight: '600', color: colors.red },

  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
  },
  fabText: { fontSize: 30, color: colors.navy, fontWeight: '400', marginTop: -2 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.gray50, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, color: colors.gray800 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: colors.gray100, marginRight: 8, borderWidth: 1.5, borderColor: 'transparent' },
  catChipActive: { backgroundColor: colors.gold + '18', borderColor: colors.gold },
  catChipText: { fontSize: 13, fontWeight: '500', color: colors.gray500, textTransform: 'capitalize' },
  catChipTextActive: { color: colors.navy, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', borderWidth: 1, borderColor: colors.gray200 },
  btnCancelText: { fontSize: 15, fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1.5, padding: 16, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', elevation: 3, shadowColor: colors.goldDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnSaveText: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
