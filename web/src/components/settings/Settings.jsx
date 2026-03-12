import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Percent, Download, Upload, Trash2, Info } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'CAD', 'AUD', 'JPY'];

export default function Settings() {
  const { state, dispatch } = useApp();
  const [showClear, setShowClear] = useState(false);
  const s = state.settings;

  function updateSetting(key, value) {
    const updates = { [key]: value };
    if (['savingsRate', 'investmentRate'].includes(key)) {
      const numVal = Number(value) || 0;
      if (key === 'savingsRate') {
        updates.livingRate = Math.max(0, 100 - numVal - s.investmentRate);
      } else {
        updates.livingRate = Math.max(0, 100 - s.savingsRate - numVal);
      }
    }
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savax-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        dispatch({ type: 'IMPORT_DATA', payload: data });
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  function handleClear() {
    localStorage.removeItem('savax_data');
    window.location.reload();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure thy treasury</p>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2 mb-3">
          <User size={18} color="var(--gold)" />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Profile</h3>
        </div>
        <div className="form-group">
          <label>Your Name</label>
          <input type="text" className="form-control" placeholder="Enter your name" value={s.name} onChange={e => updateSetting('name', e.target.value)} style={{ maxWidth: 400 }} />
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select className="form-control" value={s.currency} onChange={e => updateSetting('currency', e.target.value)} style={{ maxWidth: 200 }}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Allocation */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2 mb-3">
          <Percent size={18} color="var(--gold)" />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Income Allocation</h3>
        </div>
        <p className="text-sm text-gray mb-3">Set how your income should be split according to the Babylon method. Values must sum to 100%.</p>

        <div className="grid grid-3" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Savings Rate (%)</label>
            <input type="number" className="form-control" min="0" max="100" value={s.savingsRate} onChange={e => updateSetting('savingsRate', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Investment Rate (%)</label>
            <input type="number" className="form-control" min="0" max="100" value={s.investmentRate} onChange={e => updateSetting('investmentRate', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Living Expenses (%)</label>
            <input type="number" className="form-control" value={s.livingRate} readOnly style={{ background: 'var(--gray-50)' }} />
          </div>
        </div>

        {/* Visual bar */}
        <div style={{ height: 16, borderRadius: 8, display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: `${s.savingsRate}%`, background: '#2d6a4f', transition: 'width 0.3s' }} />
          <div style={{ width: `${s.investmentRate}%`, background: '#457b9d', transition: 'width 0.3s' }} />
          <div style={{ width: `${s.livingRate}%`, background: '#f4a261', transition: 'width 0.3s' }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray">
          <span>Savings {s.savingsRate}%</span>
          <span>Investments {s.investmentRate}%</span>
          <span>Living {s.livingRate}%</span>
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2 mb-3">
          <Download size={18} color="var(--gold)" />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Data Management</h3>
        </div>
        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export Data
          </button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Import Data
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-danger" onClick={() => setShowClear(true)}>
            <Trash2 size={16} /> Clear All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Info size={18} color="var(--gold)" />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>About Savax</h3>
        </div>
        <p className="text-sm text-gray">
          Savax v1.0 — Built on the timeless wealth-building wisdom of The Richest Man in Babylon.
          Your financial data is stored locally on your device and never sent to any server.
        </p>
      </div>

      {/* Clear Confirmation */}
      {showClear && (
        <div className="modal-overlay" onClick={() => setShowClear(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
            <Trash2 size={36} color="var(--red)" />
            <h2 style={{ marginTop: 12 }}>Clear All Data?</h2>
            <p className="text-sm text-gray" style={{ margin: '12px 0 24px' }}>
              This will permanently delete all your financial data. This action cannot be undone.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowClear(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleClear}>Yes, Clear Everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
