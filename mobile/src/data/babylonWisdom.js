export const SEVEN_LAWS = [
  {
    id: 1,
    title: 'Pay Yourself First',
    short: 'Save 10%',
    description: 'For every ten coins you earn, keep at least one for yourself.',
    icon: 'PiggyBank',
    color: '#D4AF37',
    metric: 'savings_rate',
    target: 10,
  },
  {
    id: 2,
    title: 'Control Your Spending',
    short: 'Budget Wisely',
    description: 'Plan your expenses so you always have enough for your needs and still enjoy life.',
    icon: 'Receipt',
    color: '#2d6a4f',
    metric: 'budget_adherence',
    target: 100,
  },
  {
    id: 3,
    title: 'Make Your Money Grow',
    short: 'Invest',
    description: 'Put your money to work so it earns more money for you.',
    icon: 'TrendingUp',
    color: '#457b9d',
    metric: 'investment_rate',
    target: 20,
  },
  {
    id: 4,
    title: 'Protect Your Wealth from Loss',
    short: 'Protect',
    description: 'Only invest where your money is safe. Avoid risky ventures you don\'t understand.',
    icon: 'Shield',
    color: '#e63946',
    metric: 'emergency_fund',
    target: 100,
  },
  {
    id: 5,
    title: 'Make Your Home a Worthy Investment',
    short: 'Own Assets',
    description: 'Own your home and make it a source of wealth, not just an expense.',
    icon: 'Home',
    color: '#f4a261',
    metric: 'asset_value',
    target: 100,
  },
  {
    id: 6,
    title: 'Secure Your Future Income',
    short: 'Plan Ahead',
    description: 'Plan ahead for retirement and to protect your family\'s financial future.',
    icon: 'Landmark',
    color: '#6c5ce7',
    metric: 'retirement_progress',
    target: 100,
  },
  {
    id: 7,
    title: 'Increase Your Earning Power',
    short: 'Grow Skills',
    description: 'Invest in yourself — learn more, build new skills, and become more valuable.',
    icon: 'GraduationCap',
    color: '#00b4d8',
    metric: 'skill_investment',
    target: 100,
  },
];

export const WISDOM_QUOTES = [
  "Wealth, like a tree, grows from a tiny seed.",
  "A part of all you earn is yours to keep.",
  "Money flows generously toward anyone who saves at least one-tenth of their earnings.",
  "Advice is freely given — just make sure you only take what's worth having.",
  "The hungrier you become, the clearer your mind works.",
  "Where there is determination, a way can always be found.",
  "Your actions can only be as wise as your thoughts.",
  "Better a little caution than a great regret.",
  "Wealth grows wherever people put in real effort.",
  "Opportunity doesn't wait for those who aren't prepared.",
  "Money is how we measure success in the real world.",
  "A free person sees life as a series of problems to solve — and solves them.",
  "Before any achievement comes desire. Your goals must be strong and clear.",
  "Good luck comes to those who seize opportunity.",
  "People of action are favored by good fortune.",
];

export const EXPENSE_CATEGORIES = [
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#457b9d' },
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#f4a261' },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: '#2d6a4f' },
  { id: 'utilities', name: 'Utilities', icon: 'Zap', color: '#e9c46a' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#e63946' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Music', color: '#6c5ce7' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#00b4d8' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#D4AF37' },
  { id: 'personal', name: 'Personal Care', icon: 'Sparkles', color: '#ff6b6b' },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', color: '#343a40' },
  { id: 'savings', name: 'Savings', icon: 'PiggyBank', color: '#2d6a4f' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6c757d' },
];

export const INVESTMENT_TYPES = [
  { id: 'stocks', name: 'Stocks', color: '#457b9d' },
  { id: 'bonds', name: 'Bonds', color: '#2d6a4f' },
  { id: 'real_estate', name: 'Real Estate', color: '#f4a261' },
  { id: 'crypto', name: 'Cryptocurrency', color: '#6c5ce7' },
  { id: 'mutual_funds', name: 'Mutual Funds', color: '#D4AF37' },
  { id: 'etf', name: 'ETFs', color: '#00b4d8' },
  { id: 'retirement', name: 'Retirement Fund', color: '#e63946' },
  { id: 'business', name: 'Business', color: '#343a40' },
  { id: 'other', name: 'Other', color: '#6c757d' },
];

export function getRandomWisdom() {
  return WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
}

export function getContextualWisdom(data) {
  const { totalIncome, totalSavings, totalExpenses, totalInvestments } = data;
  if (totalIncome === 0) return "The journey to wealth begins with a single step. Start tracking your income today.";
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  if (savingsRate < 10) return "Remember the first rule: save at least 10% of everything you earn. Your savings are running low.";
  if (savingsRate >= 10 && totalInvestments === 0) return "Great job saving! Now put your money to work — consider investing your savings wisely.";
  if (totalExpenses > totalIncome * 0.7) return "Watch your spending! Your expenses are over 70% of your income.";
  if (savingsRate >= 20) return "Excellent discipline! You're saving like the wealthiest people in history.";
  return getRandomWisdom();
}
