import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Receipt, TrendingUp, Target, CreditCard,
  Calculator, Scale, BarChart3, BookOpen, Settings, X, Coins
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/income', icon: Wallet, label: 'Income' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/goals', icon: Target, label: 'Savings Goals' },
  { to: '/debt', icon: CreditCard, label: 'Debt Payoff' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/networth', icon: Scale, label: 'Net Worth' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/advisor', icon: BookOpen, label: 'Babylon Advisor' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Coins size={28} color="#D4AF37" />
            <span>Savax</span>
          </div>
          <button className="sidebar-close btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              onClick={onClose}
              end={item.to === '/'}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/settings" className="nav-link" onClick={onClose}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
