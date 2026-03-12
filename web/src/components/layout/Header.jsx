import { Menu, Bell, Coins } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Header.css';

export default function Header({ onMenuClick }) {
  const { state } = useApp();
  const name = state.settings.name;

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu btn-icon" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div className="header-logo-mobile">
          <Coins size={22} color="#D4AF37" />
          <span>Savax</span>
        </div>
      </div>
      <div className="header-right">
        {name && <span className="header-greeting">Welcome, {name}</span>}
        <button className="btn-icon">
          <Bell size={18} />
        </button>
        <div className="header-avatar">
          {name ? name.charAt(0).toUpperCase() : 'S'}
        </div>
      </div>
    </header>
  );
}
