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
                  {pct >= 100 && <Text style={styles.completedBadge}>Completed!</Text>}
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <View style={styles.goalStats}>
                  <View>
                    <Text style={styles.goalStatLabel}>Saved</Text>
                    <Text style={[styles.goalStatValue, { color: colors.emerald }]}>{formatCurrency(goal.currentAmount)}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.goalStatLabel}>Progress</Text>
                    <Text style={[styles.goalStatValue, { color }]}>{pct.toFixed(0)}%</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.goalStatLabel}>Target</Text>
                    <Text style={[styles.goalStatValue, { color: colors.gold }]}>{formatCurrency(goal.targetAmount)}</Text>
                  </View>
                </View>
                <View style={styles.goalActions}>
                  <TouchableOpacity style={styles.fundBtn} onPress={() => { setShowFund(goal); setFundAmount(''); }}>
                    <Text style={styles.fundBtnText}>+ Add Funds</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Savings Goal</Text>
            <TextInput style={styles.input} placeholder="Goal Name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <TextInput style={styles.input} placeholder="Target Amount" keyboardType="numeric" value={form.targetAmount} onChangeText={v => setForm({ ...form, targetAmount: v })} />
            <TextInput style={styles.input} placeholder="Starting Amount (optional)" keyboardType="numeric" value={form.currentAmount} onChangeText={v => setForm({ ...form, currentAmount: v })} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.catChip, form.category === c && styles.catChipActive]} onPress={() => setForm({ ...form, category: c })}>
                  <Text style={[styles.catChipText, form.category === c && styles.catChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fund Modal */}
      <Modal visible={!!showFund} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Funds to {showFund?.name}</Text>
            <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={fundAmount} onChangeText={setFundAmount} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowFund(null)}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleFund}>
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
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.gray400 },
  goalCard: {
    backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalName: { fontSize: 16, fontWeight: '700', color: colors.navy },
  completedBadge: { fontSize: 11, fontWeight: '600', color: colors.emerald, backgroundColor: colors.emerald + '18', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  progressBar: { height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  goalStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  goalStatLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase' },
  goalStatValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  goalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fundBtn: { backgroundColor: colors.emerald + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  fundBtnText: { fontSize: 13, fontWeight: '600', color: colors.emerald },
  deleteBtn: { fontSize: 12, color: colors.red },
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
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray100, marginRight: 8, textTransform: 'capitalize' },
  catChipActive: { backgroundColor: colors.gold },
  catChipText: { fontSize: 12, color: colors.gray600, textTransform: 'capitalize' },
  catChipTextActive: { color: colors.navy, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gray100, alignItems: 'center' },
  btnCancelText: { fontWeight: '600', color: colors.gray600 },
  btnSave: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center' },
  btnSaveText: { fontWeight: '600', color: colors.navy },
});
