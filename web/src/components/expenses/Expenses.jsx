import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES } from '../../data/babylonWisdom';
import { formatCurrency, formatDate, getCurrentMonth, sumByField } from '../../utils/helpers';
import { Plus, Edit2, Trash2, Receipt, Filter, AlertTriangle } from 'lucide-react';

const emptyForm = { amount: '', description: '', category: 'food', date: new Date().toISOString().split('T')[0], notes: '' };

export default function Expenses() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  const currentMonth = getCurrentMonth();
  const totalExpenses = sumByField(state.expenses, 'amount');
  const monthlyExpenses = sumByField(state.expenses.filter(e => e.date?.startsWith(currentMonth)), 'amount');
  const totalIncome = sumByField(state.incomes, 'amount');
  const monthlyIncome = sumByField(state.incomes.filter(i => i.date?.startsWith(currentMonth)), 'amount');
  const budget = monthlyIncome * (state.settings.livingRate / 100);
  const budgetUsed = budget > 0 ? (monthlyExpenses / budget) * 100 : 0;
  const overBudget = budgetUsed > 100;

  const sorted = useMemo(() => {
    let items = [...state.expenses];
    if (filterCat !== 'all') items = items.filter(e => e.category === filterCat);
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [state.expenses, filterCat]);

  function getCatName(id) { return EXPENSE_CATEGORIES.find(c => c.id === id)?.name || id; }
  function getCatColor(id) { return EXPENSE_CATEGORIES.find(c => c.id === id)?.color || '#6c757d'; }

  function openAdd() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(item) { setForm({ ...item }); setEditId(item.id); setShowModal(true); }

  function handleSave() {
    if (!form.amount || !form.description) return;
    const payload = { ...form, amount: Number(form.amount) };
    if (editId) dispatch({ type: 'UPDATE_EXPENSE', payload: { ...payload, id: editId } });
    else dispatch({ type: 'ADD_EXPENSE', payload });
    setShowModal(false);
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Expenses</h1>
          <p>Control thy expenditures wisely</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Expense</button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{formatCurrency(monthlyExpenses)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Budget Status</div>
          <div className={`stat-value ${overBudget ? 'text-red' : 'text-green'}`}>{budgetUsed.toFixed(0)}%</div>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Monthly Budget ({state.settings.livingRate}% of income)</span>
          <span className="text-sm">{formatCurrency(monthlyExpenses)} / {formatCurrency(budget)}</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className={`progress-fill ${overBudget ? '' : 'progress-green'}`} style={{ width: `${Math.min(budgetUsed, 100)}%`, background: overBudget ? 'var(--red)' : undefined }} />
        </div>
        {overBudget && (
          <div className="flex items-center gap-2 mt-2" style={{ color: 'var(--red)', fontSize: '0.85rem' }}>
            <AlertTriangle size={14} /> Over budget by {formatCurrency(monthlyExpenses - budget)}
          </div>
        )}
      </div>

      {/* Filter & Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <select className="form-control" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {sorted.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {sorted.map(item => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td className="font-medium">{item.description}</td>
                    <td><span className="badge" style={{ background: getCatColor(item.category) + '22', color: getCatColor(item.category) }}>{getCatName(item.category)}</span></td>
                    <td className="font-bold text-red">{formatCurrency(item.amount)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon" onClick={() => openEdit(item)}><Edit2 size={15} /></button>
                        <button className="btn-icon" onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: item.id })}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Receipt size={48} />
            <h3>No expenses recorded</h3>
            <p>Start tracking your spending</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Edit Expense' : 'Add Expense'}</h2>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" className="form-control" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" className="form-control" placeholder="e.g., Grocery shopping" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
