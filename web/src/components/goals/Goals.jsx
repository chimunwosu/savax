import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/helpers';
import { Plus, Edit2, Trash2, Target, Calendar, Check, PlusCircle } from 'lucide-react';

const GOAL_CATEGORIES = ['emergency', 'vacation', 'home', 'car', 'education', 'retirement', 'wedding', 'other'];
const emptyForm = { name: '', targetAmount: '', currentAmount: '', deadline: '', category: 'emergency', notes: '' };

export default function Goals() {
  const { state, dispatch } = useApp();
  const { formatAmount } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [fundGoal, setFundGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  function openAdd() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(goal) { setForm({ ...goal }); setEditId(goal.id); setShowModal(true); }
  function openFund(goal) { setFundGoal(goal); setFundAmount(''); setShowFundModal(true); }

  function handleSave() {
    if (!form.name || !form.targetAmount) return;
    const payload = { ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount || 0) };
    if (editId) dispatch({ type: 'UPDATE_GOAL', payload: { ...payload, id: editId } });
    else dispatch({ type: 'ADD_GOAL', payload });
    setShowModal(false);
  }

  function handleFund() {
    if (!fundAmount || !fundGoal) return;
    dispatch({ type: 'UPDATE_GOAL', payload: { ...fundGoal, currentAmount: fundGoal.currentAmount + Number(fundAmount) } });
    setShowFundModal(false);
  }

  function getProgress(goal) {
    if (!goal.targetAmount) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  }

  function getProgressColor(pct) {
    if (pct >= 100) return 'var(--emerald)';
    if (pct >= 75) return 'var(--emerald-light)';
    if (pct >= 50) return 'var(--gold)';
    return 'var(--blue)';
  }

  function daysLeft(deadline) {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Savings Goals</h1>
          <p>Set your sights on a worthy goal</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> New Goal</button>
      </div>

      {state.goals.length > 0 ? (
        <div className="grid grid-2">
          {state.goals.map(goal => {
            const pct = getProgress(goal);
            const completed = pct >= 100;
            const days = daysLeft(goal.deadline);
            return (
              <div className="card" key={goal.id} style={{ borderLeft: `4px solid ${getProgressColor(pct)}` }}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    {completed ? <Check size={18} color="var(--emerald)" /> : <Target size={18} color="var(--gold)" />}
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{goal.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-icon" onClick={() => openFund(goal)}><PlusCircle size={15} color="var(--emerald)" /></button>
                    <button className="btn-icon" onClick={() => openEdit(goal)}><Edit2 size={15} /></button>
                    <button className="btn-icon" onClick={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })}><Trash2 size={15} /></button>
                  </div>
                </div>

                {completed && <span className="badge badge-green mb-2">Completed!</span>}

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray">Progress</span>
                  <span className="text-sm font-bold">{pct.toFixed(0)}%</span>
                </div>
                <div className="progress-bar" style={{ height: 10, marginBottom: 12 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: getProgressColor(pct) }} />
                </div>

                <div className="flex justify-between">
                  <div>
                    <div className="text-xs text-gray">Saved</div>
                    <div className="font-bold text-green">{formatAmount(goal.currentAmount)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="text-xs text-gray">Remaining</div>
                    <div className="font-bold">{formatAmount(Math.max(0, goal.targetAmount - goal.currentAmount))}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-xs text-gray">Target</div>
                    <div className="font-bold text-gold">{formatAmount(goal.targetAmount)}</div>
                  </div>
                </div>

                {goal.deadline && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray">
                    <Calendar size={14} />
                    {days !== null && days > 0 ? `${days} days left` : days === 0 ? 'Due today' : 'Past deadline'}
                    <span style={{ marginLeft: 'auto' }}>{formatDate(goal.deadline)}</span>
                  </div>
                )}

                <span className="badge badge-gold mt-3" style={{ textTransform: 'capitalize' }}>{goal.category}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <Target size={48} />
            <h3>No savings goals yet</h3>
            <p>Set a goal to start building your wealth with purpose</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Edit Goal' : 'New Savings Goal'}</h2>
            <div className="form-group">
              <label>Goal Name</label>
              <input type="text" className="form-control" placeholder="e.g., Emergency Fund" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Target Amount</label>
                <input type="number" className="form-control" placeholder="10000" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Current Amount</label>
                <input type="number" className="form-control" placeholder="0" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" className="form-control" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {GOAL_CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {showFundModal && fundGoal && (
        <div className="modal-overlay" onClick={() => setShowFundModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <h2>Add Funds to {fundGoal.name}</h2>
            <p className="text-sm text-gray mb-3">Current: {formatAmount(fundGoal.currentAmount)} / {formatAmount(fundGoal.targetAmount)}</p>
            <div className="form-group">
              <label>Amount to Add</label>
              <input type="number" className="form-control" placeholder="0.00" value={fundAmount} onChange={e => setFundAmount(e.target.value)} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowFundModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleFund}>Add Funds</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
