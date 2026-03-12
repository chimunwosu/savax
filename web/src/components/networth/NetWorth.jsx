import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, sumByField } from '../../utils/helpers';
import { Plus, Scale, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ASSET_CATEGORIES = ['property', 'vehicle', 'cash', 'other'];
const emptyForm = { name: '', amount: '', type: 'asset', category: 'cash' };

export default function NetWorth() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { totalAssets, totalLiabilities, netWorth, assetItems, liabilityItems, chartData } = useMemo(() => {
    const investmentValue = sumByField(state.investments, 'currentValue');
    const goalsSaved = state.goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    const customAssets = state.assets.filter(a => a.type === 'asset');
    const customLiabilities = state.assets.filter(a => a.type === 'liability');
    const debtTotal = sumByField(state.debts, 'balance');

    const assetItems = [];
    if (investmentValue > 0) assetItems.push({ name: 'Investments', amount: investmentValue });
    if (goalsSaved > 0) assetItems.push({ name: 'Savings Goals', amount: goalsSaved });
    customAssets.forEach(a => assetItems.push({ name: a.name, amount: Number(a.amount), id: a.id }));

    const liabilityItems = [];
    if (debtTotal > 0) liabilityItems.push({ name: 'Total Debts', amount: debtTotal });
    customLiabilities.forEach(l => liabilityItems.push({ name: l.name, amount: Number(l.amount), id: l.id }));

    const totalAssets = assetItems.reduce((s, a) => s + a.amount, 0);
    const totalLiabilities = liabilityItems.reduce((s, l) => s + l.amount, 0);

    const chartData = [
      { name: 'Assets', value: totalAssets },
      { name: 'Liabilities', value: totalLiabilities },
    ];

    return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities, assetItems, liabilityItems, chartData };
  }, [state]);

  function handleSave() {
    if (!form.name || !form.amount) return;
    dispatch({ type: 'ADD_ASSET', payload: { ...form, amount: Number(form.amount) } });
    setShowModal(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Net Worth</h1>
          <p>Know thy true wealth</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Asset/Liability</button>
      </div>

      {/* Big Net Worth */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 24, padding: 32, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff' }}>
        <Scale size={36} color="#D4AF37" />
        <div style={{ fontSize: '0.85rem', color: '#D4AF37', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Net Worth</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", color: netWorth >= 0 ? '#D4AF37' : '#e63946', margin: '8px 0' }}>
          {formatCurrency(netWorth)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Assets</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d6a4f' }}>{formatCurrency(totalAssets)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Liabilities</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e63946' }}>{formatCurrency(totalLiabilities)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Assets */}
        <div className="card" style={{ borderLeft: '4px solid var(--emerald)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} color="var(--emerald)" />
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Assets</h3>
          </div>
          {assetItems.length > 0 ? assetItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className="text-sm">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green">{formatCurrency(item.amount)}</span>
                {item.id && <button className="btn-icon" onClick={() => dispatch({ type: 'DELETE_ASSET', payload: item.id })}><Trash2 size={13} /></button>}
              </div>
            </div>
          )) : <p className="text-sm text-gray">No assets yet</p>}
          <div className="flex justify-between items-center mt-3" style={{ paddingTop: 8 }}>
            <span className="font-medium">Total</span>
            <span className="font-bold text-green" style={{ fontSize: '1.1rem' }}>{formatCurrency(totalAssets)}</span>
          </div>
        </div>

        {/* Liabilities */}
        <div className="card" style={{ borderLeft: '4px solid var(--red)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={18} color="var(--red)" />
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Liabilities</h3>
          </div>
          {liabilityItems.length > 0 ? liabilityItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <span className="text-sm">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red">{formatCurrency(item.amount)}</span>
                {item.id && <button className="btn-icon" onClick={() => dispatch({ type: 'DELETE_ASSET', payload: item.id })}><Trash2 size={13} /></button>}
              </div>
            </div>
          )) : <p className="text-sm text-gray">No liabilities - well done!</p>}
          <div className="flex justify-between items-center mt-3" style={{ paddingTop: 8 }}>
            <span className="font-medium">Total</span>
            <span className="font-bold text-red" style={{ fontSize: '1.1rem' }}>{formatCurrency(totalLiabilities)}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-header"><h3>Assets vs Liabilities</h3></div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              <Cell fill="#2d6a4f" />
              <Cell fill="#e63946" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Asset / Liability</h2>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" placeholder="e.g., House, Car Loan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Amount</label>
                <input type="number" className="form-control" placeholder="50000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {ASSET_CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
