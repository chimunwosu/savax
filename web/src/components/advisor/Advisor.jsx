import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../context/CurrencyContext';
import { SEVEN_LAWS, getRandomWisdom } from '../../data/babylonWisdom';
import { sumByField } from '../../utils/helpers';
import { BookOpen, Star, CheckCircle, AlertCircle, Lightbulb, Award, Shield, TrendingUp, PiggyBank, GraduationCap, Home, Landmark } from 'lucide-react';

const ICONS = { PiggyBank, Receipt: Shield, TrendingUp, Shield, Home, Landmark, GraduationCap };

export default function Advisor() {
  const { state } = useApp();
  const { formatAmount } = useCurrency();

  const analysis = useMemo(() => {
    const totalIncome = sumByField(state.incomes, 'amount');
    const totalExpenses = sumByField(state.expenses, 'amount');
    const totalInvested = sumByField(state.investments, 'investedAmount');
    const totalDebt = sumByField(state.debts, 'balance');
    const goalsCount = state.goals.length;
    const goalsSaved = state.goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    const goalsTarget = state.goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const budgetOk = totalIncome > 0 ? totalExpenses <= totalIncome * 0.7 : false;
    const investmentRate = totalIncome > 0 ? (totalInvested / totalIncome) * 100 : 0;
    const goalProgress = goalsTarget > 0 ? (goalsSaved / goalsTarget) * 100 : 0;

    // Health score
    let score = 0;
    score += Math.min(25, savingsRate * 2.5);
    score += budgetOk ? 25 : Math.min(25, (1 - (totalExpenses / Math.max(totalIncome * 0.7, 1))) * 25);
    score += Math.min(20, investmentRate);
    score += totalDebt === 0 ? 15 : Math.max(0, 15 - (totalDebt / Math.max(totalIncome, 1)) * 15);
    score += Math.min(15, goalProgress * 0.15);
    score = Math.round(Math.max(0, Math.min(100, score)));

    const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
    const gradeColor = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--gold)' : 'var(--red)';

    // Action items
    const actions = [];
    if (totalIncome === 0) actions.push({ text: 'Start by recording your income sources', icon: 'income' });
    if (savingsRate < 10 && totalIncome > 0) actions.push({ text: `Increase savings to at least 10% (currently ${savingsRate.toFixed(1)}%)`, icon: 'savings' });
    if (totalInvested === 0 && totalIncome > 0) actions.push({ text: 'Begin investing to make your gold multiply', icon: 'invest' });
    if (totalDebt > 0) actions.push({ text: `Focus on eliminating ${formatAmount(totalDebt)} in debt`, icon: 'debt' });
    if (goalsCount === 0) actions.push({ text: 'Set a savings goal to stay motivated', icon: 'goal' });
    if (!budgetOk && totalIncome > 0) actions.push({ text: 'Reduce expenses to stay within 70% of income', icon: 'budget' });
    if (actions.length === 0) actions.push({ text: 'Keep up the excellent work! You follow the laws of Babylon well.', icon: 'success' });

    // Law progress
    const lawData = SEVEN_LAWS.map((law, i) => {
      let progress = 0;
      let status = '';
      if (i === 0) { progress = Math.min(100, savingsRate * 10); status = savingsRate >= 10 ? 'Well done! You save at least 10%.' : `Save more - currently at ${savingsRate.toFixed(1)}%.`; }
      else if (i === 1) { progress = budgetOk ? 100 : Math.min(99, (totalIncome * 0.7 / Math.max(totalExpenses, 1)) * 100); status = budgetOk ? 'Expenses are within budget.' : 'Spending exceeds 70% of income.'; }
      else if (i === 2) { progress = Math.min(100, investmentRate * 5); status = totalInvested > 0 ? `${formatAmount(totalInvested)} invested.` : 'Start investing your savings.'; }
      else if (i === 3) { progress = totalDebt === 0 ? 100 : Math.max(0, 50); status = totalDebt === 0 ? 'No risky debts. Well guarded!' : 'Work on reducing debt exposure.'; }
      else if (i === 4) { const hasAssets = state.assets.some(a => a.type === 'asset') || state.investments.length > 0; progress = hasAssets ? 75 : 0; status = hasAssets ? 'You own productive assets.' : 'Consider acquiring assets.'; }
      else if (i === 5) { const hasRetirement = state.goals.some(g => g.category === 'retirement'); progress = hasRetirement ? 75 : 0; status = hasRetirement ? 'Retirement planning in progress.' : 'Plan for your future income.'; }
      else if (i === 6) { const hasEdu = state.expenses.some(e => e.category === 'education'); progress = hasEdu ? 75 : 0; status = hasEdu ? 'Investing in your skills.' : 'Invest in education and skills.'; }
      return { ...law, progress: Math.round(progress), status };
    });

    return { score, grade, gradeColor, actions, lawData, savingsRate, totalIncome, totalExpenses, totalInvested, totalDebt };
  }, [state, formatAmount]);

  const wisdom = useMemo(() => getRandomWisdom(), []);

  return (
    <div>
      <div className="page-header">
        <h1>Babylon Advisor</h1>
        <p>Wisdom of the ages for thy journey</p>
      </div>

      {/* Health Score + Daily Wisdom */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <Award size={32} color="var(--gold)" />
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Financial Health Score</div>
          <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", color: analysis.gradeColor, lineHeight: 1.2 }}>
            {analysis.grade}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: analysis.gradeColor }}>{analysis.score}/100</div>
          <div className="progress-bar mt-3" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${analysis.score}%`, background: analysis.gradeColor }} />
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 32 }}>
          <BookOpen size={28} color="#D4AF37" />
          <div style={{ fontSize: '0.75rem', color: '#D4AF37', marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Daily Wisdom</div>
          <p style={{ fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.7, marginTop: 12, opacity: 0.9 }}>
            "{wisdom}"
          </p>
        </div>
      </div>

      {/* Action Items */}
      <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--gold)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={20} color="var(--gold)" />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Action Items</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {analysis.actions.map((action, i) => (
            <div key={i} className="flex items-center gap-3" style={{ padding: '10px 14px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
              {action.icon === 'success'
                ? <CheckCircle size={18} color="var(--emerald)" />
                : <AlertCircle size={18} color="var(--gold)" />}
              <span className="text-sm">{action.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7 Laws */}
      <h2 style={{ marginBottom: 16 }}>The Seven Laws of Wealth</h2>
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {analysis.lawData.map(law => {
          const IconComponent = ICONS[law.icon] || Star;
          return (
            <div className="card" key={law.id} style={{ borderLeft: `4px solid ${law.color}` }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: law.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent size={20} color={law.color} />
                </div>
                <div>
                  <div className="text-xs text-gray">Law {law.id}</div>
                  <div className="font-medium text-sm">{law.title}</div>
                </div>
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--gray-500)', margin: '8px 0', lineHeight: 1.5 }}>
                "{law.description}"
              </p>
              <div className="flex justify-between items-center mb-2 mt-3">
                <span className="text-sm">{law.status}</span>
                <span className="text-xs font-bold" style={{ color: law.color }}>{law.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${law.progress}%`, background: law.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
