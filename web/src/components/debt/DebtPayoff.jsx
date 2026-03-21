import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../context/CurrencyContext';
import { calcDebtPayoff } from '../../utils/helpers';
import { Plus, Edit2, Trash2, CreditCard, ArrowDown, ArrowUp } from 'lucide-react';

const emptyForm = { name: '', balance: '', interestRate: '', minPayment: '', extraPayment: '0' };

export default function DebtPayoff() {
  const { state, dispatch } = useApp();
  const { formatAmount } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [strategy, setStrategy] = useState('avalanche');

  const totalDebt = useMemo(() => state.debts.reduce((s, d) => s + Number(d.balance), 0), [state.debts]);
  const totalPayments = useMemo(() => state.debts.reduce((s, d) => s + Number(d.minPayment) + Number(d.extraPayment || 0), 0), [state.debts]);

  const sortedDebts = useMemo(() => {
    const debts = [...state.debts];
    if (strategy === 'avalanche') return debts.sort((a, b) => Number(b.interestRate) - Number(a.interestRate));
    return debts.sort((a, b) => Number(a.balance) - Number(b.balance));
  }, [state.debts, strategy]);

  function openAdd() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(debt) { setForm({ ...debt }); setEditId(debt.id); setShowModal(true); }

  function handleSave() {
    if (!form.name || !form.balance || !form.minPayment) return;
    const payload = {
      ...form,
      balance: Number(form.balance),
      interestRate: Number(form.interestRate),
      minPayment: Number(form.minPayment),
      extraPayment: Number(form.extraPayment || 0),
    };
    if (editId) dispatch({ type: 'UPDATE_DEBT', payload: { ...payload, id: editId } });
    else dispatch({ type: 'ADD_DEBT', payload });
    setShowModal(false);
  }

  function getPayoffInfo(debt) {
    const payment = Number(debt.minPayment) + Number(debt.extraPayment || 0);
    const result = calcDebtPayoff(Number(debt.balance), Number(debt.interestRate), payment);
    const baseResult = calcDebtPayoff(Number(debt.balance), Number(debt.interestRate), Number(debt.minPayment));
    const interestSaved = baseResult.totalPaid - result.totalPaid;
    return { ...result, interestSaved };
  }

  const totalMonths = useMemo(() => {
    if (state.debts.length === 0) return 0;
    return Math.max(...state.debts.map(d => {
      const payment = Number(d.minPayment) + Number(d.extraPayment || 0);
      return calcDebtPayoff(Number(d.balance), Number(d.interestRate), payment).months;
    }));
  }, [state.debts]);

  function formatMonths(m) {
    if (m === Infinity || m >= 600) return 'Never';
    const y = Math.floor(m / 12);
    const mo = m % 12;
    if (y > 0) return `${y}y ${mo}m`;
    return `${mo} months`;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Debt Payoff</h1>
          <p>Guard thy treasures from loss</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Debt</button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-label">Total Debt</div>
          <div className="stat-value text-red">{formatAmount(totalDebt)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Monthly Payments</div>
          <div className="stat-value">{formatAmount(totalPayments)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Debt-Free In</div>
          <div className="stat-value">{totalMonths > 0 ? formatMonths(totalMonths) : 'No debts!'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex justify-between items-center">
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Payoff Strategy</h3>
          <div className="flex gap-2">
            <button className={`btn btn-sm ${strategy === 'avalanche' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStrategy('avalanche')}>
              <ArrowDown size={14} /> Avalanche
            </button>
            <button className={`btn btn-sm ${strategy === 'snowball' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStrategy('snowball')}>
              <ArrowUp size={14} /> Snowball
            </button>
          </div>
        </div>
        <p className="text-sm text-gray mt-2">
          {strategy === 'avalanche'
            ? 'Pay highest interest rate first - saves the most money over time.'
            : 'Pay smallest balance first - builds momentum with quick wins.'}
        </p>
      </div>

      <div className="card">
        {sortedDebts.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Balance</th><th>Rate</th><th>Payment</th><th>Payoff</th><th>Interest Saved</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {sortedDebts.map(debt => {
                  const info = getPayoffInfo(debt);
                  return (
                    <tr key={debt.id}>
                      <td className="font-medium">{debt.name}</td>
                      <td className="text-red font-bold">{formatAmount(debt.balance)}</td>
                      <td>{debt.interestRate}%</td>
                      <td>{formatAmount(Number(debt.minPayment) + Number(debt.extraPayment || 0))}</td>
                      <td>{formatMonths(info.months)}</td>
                      <td className="text-green">{info.interestSaved > 0 ? formatAmount(info.interestSaved) : '-'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-icon" onClick={() => openEdit(debt)}><Edit2 size={15} /></button>
                          <button className="btn-icon" onClick={() => dispatch({ type: 'DELETE_DEBT', payload: debt.id })}><Trash2 size={15} /></button>
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
            <CreditCard size={48} />
            <h3>No debts tracked</h3>
            <p>Congratulations if you're debt-free! Or add debts to plan your payoff.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? 'Edit Debt' : 'Add Debt'}</h2>
            <div className="form-group">
              <label>Debt Name</label>
              <input type="text" className="form-control" placeholder="e.g., Credit Card" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Balance</label>
                <input type="number" className="form-control" placeholder="5000" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input type="number" className="form-control" placeholder="18.5" step="0.1" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Minimum Payment</label>
                <input type="number" className="form-control" placeholder="100" value={form.minPayment} onChange={e => setForm({ ...form, minPayment: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Extra Payment</label>
                <input type="number" className="form-control" placeholder="0" value={form.extraPayment} onChange={e => setForm({ ...form, extraPayment: e.target.value })} />
              </div>
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
