import { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import { Calculator as CalcIcon, DollarSign, Percent, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Calculator() {
  const [principal, setPrincipal] = useState(1000);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);

  const { chartData, futureValue, totalContributions, totalInterest } = useMemo(() => {
    const data = [];
    let balance = Number(principal) || 0;
    const monthlyRate = (Number(rate) || 0) / 100 / 12;
    const monthlyAmount = Number(monthly) || 0;
    let totalContrib = Number(principal) || 0;

    data.push({ year: 0, balance: Math.round(balance), contributions: Math.round(totalContrib), interest: 0 });

    for (let y = 1; y <= (Number(years) || 1); y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + monthlyAmount;
        totalContrib += monthlyAmount;
      }
      data.push({
        year: y,
        balance: Math.round(balance),
        contributions: Math.round(totalContrib),
        interest: Math.round(balance - totalContrib),
      });
    }

    return {
      chartData: data,
      futureValue: balance,
      totalContributions: totalContrib,
      totalInterest: balance - totalContrib,
    };
  }, [principal, monthly, rate, years]);

  return (
    <div>
      <div className="page-header">
        <h1>Compound Interest Calculator</h1>
        <p>Watch thy gold multiply over time</p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Inputs */}
        <div className="card">
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 20 }}>Calculate Your Growth</h3>
          <div className="form-group">
            <label className="flex items-center gap-2"><DollarSign size={14} /> Initial Investment</label>
            <input type="number" className="form-control" value={principal} onChange={e => setPrincipal(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2"><DollarSign size={14} /> Monthly Contribution</label>
            <input type="number" className="form-control" value={monthly} onChange={e => setMonthly(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2"><Percent size={14} /> Annual Return Rate (%)</label>
            <input type="number" className="form-control" step="0.1" value={rate} onChange={e => setRate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2"><Clock size={14} /> Time Period (Years)</label>
            <input type="number" className="form-control" min="1" max="50" value={years} onChange={e => setYears(e.target.value)} />
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="grid" style={{ gap: 16 }}>
            <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
              <div className="stat-label">Future Value</div>
              <div className="stat-value" style={{ color: 'var(--gold-dark)', fontSize: '1.75rem' }}>{formatCurrency(futureValue)}</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--blue)' }}>
              <div className="stat-label">Total Contributions</div>
              <div className="stat-value">{formatCurrency(totalContributions)}</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--emerald)' }}>
              <div className="stat-label">Interest Earned</div>
              <div className="stat-value text-green">{formatCurrency(totalInterest)}</div>
            </div>
          </div>

          {/* Wisdom */}
          <div className="card card-gold mt-4" style={{ background: 'var(--cream)' }}>
            <div className="flex items-center gap-2 mb-2">
              <CalcIcon size={18} color="var(--gold)" />
              <span className="font-medium text-sm" style={{ color: 'var(--gold-dark)' }}>Babylon Insight</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--gray-600)', lineHeight: 1.6 }}>
              At {rate}% annual return, your {formatCurrency(monthly)}/month grows to {formatCurrency(futureValue)} in {years} years.
              That's {formatCurrency(totalInterest)} earned from compound growth alone.
              As the ancient Babylonians knew: gold that labors multiplies itself.
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-header"><h3>Growth Over Time</h3></div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Area type="monotone" dataKey="contributions" name="Contributions" stackId="1" stroke="#457b9d" fill="rgba(69,123,157,0.4)" />
            <Area type="monotone" dataKey="interest" name="Interest" stackId="1" stroke="#2d6a4f" fill="rgba(45,106,79,0.4)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
