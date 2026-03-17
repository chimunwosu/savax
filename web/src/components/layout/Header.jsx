import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Coins, Settings, LogOut, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header({ onMenuClick }) {
  const { state } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.name || state.settings.name || '';

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

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
        {displayName && <span className="header-greeting">Welcome, {displayName}</span>}
        <button className="btn-icon">
          <Bell size={18} />
        </button>
        <div className="user-menu-wrap" ref={menuRef}>
          <button
            className="header-avatar"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {displayName ? displayName.charAt(0).toUpperCase() : 'S'}
          </button>
          {menuOpen && (
            <div className="user-menu">
              <div className="user-menu-header">
                <strong>{displayName || 'User'}</strong>
                <span>{user?.email || ''}</span>
              </div>
              <button className="user-menu-item" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                <User size={16} /> Profile
              </button>
              <button className="user-menu-item" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                <Settings size={16} /> Settings
              </button>
              <div className="user-menu-divider" />
              <button className="user-menu-item logout" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
