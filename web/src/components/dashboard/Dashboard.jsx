import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getMonthRange, groupByMonth, sumByField } from '../../utils/helpers';
import { SEVEN_LAWS, getContextualWisdom } from '../../data/babylonWisdom';
import { Wallet, TrendingDown, TrendingUp, PiggyBank, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#457b9d','#f4a261','#2d6a4f','#e63946','#6c5ce7','#00b4d8','#D4AF37','#343a40','#ff6b6b','#e9c46a','#6c757d','#a8dadc'];

export default function Dashboard() {
  const { state } = useApp();

  const stats = useMemo(() => {
    const totalIncome = sumByField(state.incomes, 'amount');
    const totalExpenses = sumByField(state.expenses, 'amount');
    const totalInvestments = sumByField(state.investments, 'currentValue');
    const totalInvested = sumByField(state.investments, 'investedAmount');
    const totalSavings = totalIncome - totalExpenses;
    const goalsSaved = state.goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    return { totalIncome, totalExpenses, totalSavings, totalInvestments, totalInvested, goalsSaved };
  }, [state]);

  const chartData = useMemo(() => {
    const months = getMonthRange(6);
    const incomeByMonth = groupByMonth(state.incomes);
    const expenseByMonth = groupByMonth(state.expenses);
    return months.map(m => ({
      month: m.substring(5),
      income: sumByField(incomeByMonth[m] || [], 'amount'),
      expenses: sumByField(expenseByMonth[m] || [], 'amount'),
    }));
  }, [state.incomes, state.expenses]);

  const expenseByCategory = useMemo(() => {
    const cats = {};
    state.expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [state.expenses]);

  const lawProgress = useMemo(() => {
    const { totalIncome, totalExpenses, totalInvestments } = stats;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const budgetOk = totalIncome > 0 ? Math.min(100, ((totalIncome * 0.7) / Math.max(totalExpenses, 1)) * 100) : 0;
    const investRate = totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0;
    const hasEmergency = state.goals.some(g => g.category === 'emergency' && g.currentAmount >= g.targetAmount);
    const hasAssets = state.assets.filter(a => a.type === 'asset').length > 0 || state.investments.length > 0;
    const hasRetirement = state.goals.some(g => g.category === 'retirement');
    const hasEducation = state.expenses.some(e => e.category === 'education');

    return SEVEN_LAWS.map((law, i) => {
      let progress = 0;
      if (i === 0) progress = Math.min(100, savingsRate * 10);
      else if (i === 1) progress = Math.min(100, budgetOk);
      else if (i === 2) progress = Math.min(100, investRate * 5);
      else if (i === 3) progress = hasEmergency ? 100 : state.goals.some(g => g.category === 'emergency') ? 50 : 0;
      else if (i === 4) progress = hasAssets ? 75 : 0;
      else if (i === 5) progress = hasRetirement ? 75 : 0;
      else if (i === 6) progress = hasEducation ? 75 : 0;
      return { ...law, progress: Math.round(progress) };
    });
  }, [stats, state]);

  const wisdom = useMemo(() => getContextualWisdom(stats), [stats]);

  const recentTransactions = useMemo(() => {
    const all = [
      ...state.incomes.map(i => ({ ...i, txType: 'income' })),
      ...state.expenses.map(e => ({ ...e, txType: 'expense' })),
    ];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [state.incomes, state.expenses]);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your wealth at a glance</p>
      </div>

      {/* Wisdom Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: 'var(--radius)',
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        color: '#fff'
      }}>
        <BookOpen size={32} color="#D4AF37" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Wisdom of Babylon</div>
          <div style={{ fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.5, opacity: 0.9 }}>{wisdom}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Income', value: stats.totalIncome, icon: Wallet, color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
          { label: 'Total Expenses', value: stats.totalExpenses, icon: TrendingDown, color: '#e63946', bg: 'rgba(230,57,70,0.12)' },
          { label: 'Net Savings', value: stats.totalSavings, icon: PiggyBank, color: '#2d6a4f', bg: 'rgba(45,106,79,0.12)' },
          { label: 'Investments', value: stats.totalInvestments, icon: TrendingUp, color: '#457b9d', bg: 'rgba(69,123,157,0.12)' },
        ].map((s, i) => (
          <div className="card" key={i}>
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{formatCurrency(s.value)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Income vs Expenses Chart */}
        <div className="card">
          <div className="card-header"><h3>Income vs Expenses</h3></div>
          {chartData.some(d => d.income > 0 || d.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#D4AF37" fill="rgba(212,175,55,0.3)" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#e63946" fill="rgba(230,57,70,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>Add income and expenses to see trends</p></div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="card">
          <div className="card-header"><h3>Expense Breakdown</h3></div>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No expenses recorded yet</p></div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        {/* 7 Laws Progress */}
        <div className="card card-gold">
          <div className="card-header"><h3>The 7 Laws of Wealth</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lawProgress.map(law => (
              <div key={law.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{law.short}</span>
                  <span className="text-xs text-gray">{law.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill progress-gold" style={{ width: `${law.progress}%`, background: law.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          {recentTransactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div>
                    <div className="text-sm font-medium">{tx.source || tx.description}</div>
                    <div className="text-xs text-gray">{new Date(tx.date).toLocaleDateString()}</div>
                  </div>
                  <span className={`font-bold ${tx.txType === 'income' ? 'text-green' : 'text-red'}`}>
                    {tx.txType === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>No transactions yet</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
