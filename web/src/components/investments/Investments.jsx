import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../context/CurrencyContext';
import { INVESTMENT_TYPES } from '../../data/babylonWisdom';
import { formatDate, sumByField } from '../../utils/helpers';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const emptyForm = { name: '', type: 'stocks', investedAmount: '', currentValue: '', date: new Date().toISOString().split('T')[0], notes: '' };

export default function Investments() {
  const { state, dispatch } = useApp();
  const { formatAmount } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const totalInvested = sumByField(state.investments, 'investedAmount');
  const totalCurrent = sumByField(state.investments, 'currentValue');
  const totalReturn = totalCurrent - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const pieData = useMemo(() => {
    const grouped = {};
    state.investments.forEach(inv => {
      const typeName = INVESTMENT_TYPES.find(t => t.id === inv.type)?.name || inv.type;
      grouped[typeName] = (grouped[typeName] || 0) + Number(inv.currentValue || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [state.investments]);

  const sorted = useMemo(() =>
    [...state.investments].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.investments]
  );

  function openAdd() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(item) { setForm({ ...item }); setEditId(item.id); setShowModal(true); }

  function handleSave() {
    if (!form.name || !form.investedAmount) return;
    const payload = { ...form, investedAmount: Number(form.investedAmount), currentValue: Number(form.currentValue || form.investedAmount) };
    if (editId) dispatch({ type: 'UPDATE_INVESTMENT', payload: { ...payload, id: editId } });
    else dispatch({ type: 'ADD_INVESTMENT', payload });
    setShowModal(false);
  }

  function getReturn(inv) {
    const ret = Number(inv.currentValue) - Number(inv.investedAmount);
    const pct = inv.investedAmount > 0 ? (ret / inv.investedAmount) * 100 : 0;
    return { ret, pct };
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Investments</h1>
          <p>Make thy gold multiply</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Investment</button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-label">Total Invested</div>
          <div className="stat-value">{formatAmount(totalInvested)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Current Value</div>
          <div className="stat-value">{formatAmount(totalCurrent)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Total Returns</div>
          <div className={`stat-value ${totalReturn >= 0 ? 'text-green' : 'text-red'}`}>
            {totalReturn >= 0 ? '+' : ''}{formatAmount(totalReturn)}
          </div>
          <span className={`badge mt-2 ${returnPct >= 0 ? 'badge-green' : 'badge-red'}`}>
            {returnPct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {returnPct.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Portfolio Allocation</h3></div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={INVESTMENT_TYPES[i % INVESTMENT_TYPES.length]?.color || '#6c757d'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatAmount(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>Add investments to see allocation</p></div>
          )}
        </div>
        <div className="card card-gold" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>The Third Law</h3>
          <p style={{ fontStyle: 'italic', color: 'var(--gray-600)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            "Put each coin to laboring that it may reproduce its kind. Make thy gold multiply."
          </p>
          <p className="text-sm text-gray mt-3">
            Invest wisely and let compound growth work in your favor. Diversify across asset classes to guard against loss.
          </p>
        </div>
      </div>

      <div className="card">
        {sorted.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Invested</th><th>Current Value</th><th>Return</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {sorted.map(inv => {
                  const { ret, pct } = getReturn(inv);
                  return (
                    <tr key={inv.id}>
                      <td className="font-medium">{inv.name}</td>
                      <td><span className="badge badge-blue">{INVESTMENT_TYPES.find(t => t.id === inv.type)?.name || inv.type}</span></td>
                      <td>{formatAmount(inv.investedAmount)}</td>
                      <td className="font-bold">{formatAmount(inv.currentValue)}</td>
                      <td className={ret >= 0 ? 'text-green' : 'text-red'}>{ret >= 0 ? '+' : ''}{formatAmount(ret)} ({pct.toFixed(1)}%)</td>
                      <td>{formatDate(inv.date)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-icon" onClick={() => openEdit(inv)}><Edit2 size={15} /></button>
                          <button className="btn-icon" onClick={() => dispatch({ type: 'DELETE_INVESTMENT', payload: inv.id })}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <TrendingUp size={48} />
            <h3>No investments yet</h3>
            <p>Start investing to make your gold multiply</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Edit Investment' : 'Add Investment'}</h2>
            <div className="form-group">
              <label>Investment Name</label>
              <input type="text" className="form-control" placeholder="e.g., S&P 500 ETF" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {INVESTMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Amount Invested</label>
                <input type="number" className="form-control" placeholder="0.00" value={form.investedAmount} onChange={e => setForm({ ...form, investedAmount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Current Value</label>
                <input type="number" className="form-control" placeholder="0.00" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
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
