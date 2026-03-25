import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getMonthRange, groupByMonth, sumByField } from '../../utils/helpers';
import { EXPENSE_CATEGORIES } from '../../data/babylonWisdom';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#457b9d','#f4a261','#2d6a4f','#e63946','#6c5ce7','#00b4d8','#D4AF37','#343a40','#ff6b6b','#e9c46a'];

export default function Reports() {
  const { state } = useApp();
  const { formatAmount } = useCurrency();
  const [period, setPeriod] = useState(6);

  const { monthlyData, categoryData, insights } = useMemo(() => {
    const months = getMonthRange(period);
    const incomeByMonth = groupByMonth(state.incomes);
    const expenseByMonth = groupByMonth(state.expenses);

    const monthlyData = months.map(m => {
      const income = sumByField(incomeByMonth[m] || [], 'amount');
      const expenses = sumByField(expenseByMonth[m] || [], 'amount');
      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;
      return { month: m.substring(5), income, expenses, savings, savingsRate: Math.round(savingsRate) };
    });

    const catTotals = {};
    state.expenses.forEach(e => {
      const name = EXPENSE_CATEGORIES.find(c => c.id === e.category)?.name || e.category;
      catTotals[name] = (catTotals[name] || 0) + Number(e.amount);
    });
    const categoryData = Object.entries(catTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const validMonths = monthlyData.filter(m => m.income > 0);
    const avgSavingsRate = validMonths.length > 0
      ? validMonths.reduce((s, m) => s + m.savingsRate, 0) / validMonths.length
      : 0;
    const bestMonth = validMonths.reduce((best, m) => m.savingsRate > (best?.savingsRate || -Infinity) ? m : best, null);
    const topCategory = categoryData[0];
    const recentMonths = validMonths.slice(-3);
    const trend = recentMonths.length >= 2
      ? recentMonths[recentMonths.length - 1].savingsRate >= recentMonths[0].savingsRate ? 'improving' : 'declining'
      : 'neutral';

    return {
      monthlyData,
      categoryData,
      insights: { avgSavingsRate, bestMonth, topCategory, trend },
    };
  }, [state.incomes, state.expenses, period]);

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Financial Reports</h1>
          <p>Review your financial progress</p>
        </div>
        <div className="flex gap-2">
          {[3, 6, 12].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPeriod(p)}>
              {p}M
            </button>
          ))}
        </div>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>Income vs Expenses</h3></div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={v => formatAmount(v)} />
            <Tooltip formatter={(v) => formatAmount(v)} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#e63946" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Savings Rate Chart */}
        <div className="card">
          <div className="card-header"><h3>Savings Rate Trend</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
              <XAxis dataKey="month" />
              <YAxis unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="savingsRate" name="Savings Rate" stroke="#2d6a4f" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="card">
          <div className="card-header"><h3>Expense Categories</h3></div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatAmount(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No expense data yet</p></div>
          )}
        </div>
      </div>

      {/* Key Insights */}
      <div className="card card-gold">
        <div className="flex items-center gap-2 mb-3">
          <Award size={20} color="var(--gold)" />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Key Insights</h3>
        </div>
        <div className="grid grid-4">
          <div>
            <div className="stat-label">Avg Savings Rate</div>
            <div className={`font-bold ${insights.avgSavingsRate >= 10 ? 'text-green' : 'text-red'}`} style={{ fontSize: '1.25rem' }}>
              {insights.avgSavingsRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="stat-label">Best Month</div>
            <div className="font-bold" style={{ fontSize: '1.25rem' }}>
              {insights.bestMonth ? insights.bestMonth.month : '-'}
            </div>
          </div>
          <div>
            <div className="stat-label">Top Expense</div>
            <div className="font-bold" style={{ fontSize: '1rem' }}>
              {insights.topCategory ? insights.topCategory.name : '-'}
            </div>
          </div>
          <div>
            <div className="stat-label">Trend</div>
            <div className="flex items-center gap-2" style={{ fontSize: '1.25rem', fontWeight: 700, color: insights.trend === 'improving' ? 'var(--emerald)' : insights.trend === 'declining' ? 'var(--red)' : 'var(--gray-500)' }}>
              {insights.trend === 'improving' ? <TrendingUp size={18} /> : insights.trend === 'declining' ? <TrendingDown size={18} /> : null}
              {insights.trend.charAt(0).toUpperCase() + insights.trend.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="card mt-4">
        <div className="card-header"><h3>Monthly Summary</h3></div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings</th><th>Rate</th></tr>
            </thead>
            <tbody>
              {monthlyData.map(m => (
                <tr key={m.month}>
                  <td className="font-medium">{m.month}</td>
                  <td className="text-green">{formatAmount(m.income)}</td>
                  <td className="text-red">{formatAmount(m.expenses)}</td>
                  <td className={m.savings >= 0 ? 'text-green' : 'text-red'}>{formatAmount(m.savings)}</td>
                  <td><span className={`badge ${m.savingsRate >= 10 ? 'badge-green' : m.savingsRate >= 0 ? 'badge-gold' : 'badge-red'}`}>{m.savingsRate}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
