import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getCurrentMonth, sumByField } from '../../utils/helpers';
import { Plus, Edit2, Trash2, Wallet, DollarSign } from 'lucide-react';

const INCOME_TYPES = ['Salary', 'Freelance', 'Business', 'Passive', 'Other'];

const emptyForm = { amount: '', source: '', date: new Date().toISOString().split('T')[0], type: 'Salary', notes: '' };

export default function Income() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const currentMonth = getCurrentMonth();
  const totalIncome = sumByField(state.incomes, 'amount');
  const monthlyIncome = sumByField(state.incomes.filter(i => i.date?.startsWith(currentMonth)), 'amount');
  const months = new Set(state.incomes.map(i => i.date?.substring(0, 7)));
  const avgMonthly = months.size > 0 ? totalIncome / months.size : 0;

  const { savingsRate, investmentRate, livingRate } = state.settings;

  const sorted = useMemo(() =>
    [...state.incomes].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.incomes]
  );

  function openAdd() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(item) { setForm({ ...item }); setEditId(item.id); setShowModal(true); }

  function handleSave() {
    if (!form.amount || !form.source) return;
    const payload = { ...form, amount: Number(form.amount) };
    if (editId) dispatch({ type: 'UPDATE_INCOME', payload: { ...payload, id: editId } });
    else dispatch({ type: 'ADD_INCOME', payload });
    setShowModal(false);
  }

  function handleDelete(id) { dispatch({ type: 'DELETE_INCOME', payload: id }); }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Income</h1>
          <p>Track thy earnings and watch thy purse grow</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Income</button>
      </div>

      {/* Stats */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-label">Total Income</div>
          <div className="stat-value">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{formatCurrency(monthlyIncome)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Monthly Average</div>
          <div className="stat-value">{formatCurrency(avgMonthly)}</div>
        </div>
      </div>

      {/* Babylon Split */}
      <div className="card card-gold" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 12 }}>The Babylon Split</h3>
        <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          {[
            { label: 'Savings', pct: savingsRate, color: '#2d6a4f', amount: monthlyIncome * savingsRate / 100 },
            { label: 'Investments', pct: investmentRate, color: '#457b9d', amount: monthlyIncome * investmentRate / 100 },
            { label: 'Living', pct: livingRate, color: '#f4a261', amount: monthlyIncome * livingRate / 100 },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--cream)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.pct}%</div>
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs text-gray">{formatCurrency(s.amount)}/mo</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: `${savingsRate}%`, background: '#2d6a4f' }} />
          <div style={{ width: `${investmentRate}%`, background: '#457b9d' }} />
          <div style={{ width: `${livingRate}%`, background: '#f4a261' }} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {sorted.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Source</th><th>Type</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {sorted.map(item => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td className="font-medium">{item.source}</td>
                    <td><span className="badge badge-gold">{item.type}</span></td>
                    <td className="font-bold text-green">{formatCurrency(item.amount)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon" onClick={() => openEdit(item)}><Edit2 size={15} /></button>
                        <button className="btn-icon" onClick={() => handleDelete(item.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Wallet size={48} />
            <h3>No income recorded yet</h3>
            <p>Start by adding your income sources</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Edit Income' : 'Add Income'}</h2>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" className="form-control" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Source</label>
              <input type="text" className="form-control" placeholder="e.g., Monthly Salary" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {INCOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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
