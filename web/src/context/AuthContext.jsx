import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = 'savax_auth';
const USERS_STORAGE_KEY = 'savax_users';

function getStoredUsers() {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getStoredAuth() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      const users = getStoredUsers();
      const found = users.find(u => u.id === stored.id);
      if (found) {
        setUser({ id: found.id, name: found.name, email: found.email, avatar: found.avatar });
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  function register({ name, email, password }) {
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      avatar: name.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const session = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
    setUser(session);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true };
  }

  function login({ email, password }) {
    const users = getStoredUsers();
    const found = users.find(u => u.email === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'No account found with this email.' };
    }
    if (found.password !== hashPassword(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    const session = { id: found.id, name: found.name, email: found.email, avatar: found.avatar };
    setUser(session);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  function updateProfile(updates) {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return { success: false, error: 'User not found.' };
    users[idx] = { ...users[idx], ...updates, avatar: updates.name ? updates.name.charAt(0).toUpperCase() : users[idx].avatar };
    saveUsers(users);
    const session = { id: users[idx].id, name: users[idx].name, email: users[idx].email, avatar: users[idx].avatar };
    setUser(session);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true };
  }

  function changePassword(currentPassword, newPassword) {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return { success: false, error: 'User not found.' };
    if (users[idx].password !== hashPassword(currentPassword)) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    users[idx].password = hashPassword(newPassword);
    saveUsers(users);
    return { success: true };
  }

  function resetPassword(email) {
    const users = getStoredUsers();
    const found = users.find(u => u.email === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'No account found with this email.' };
    }
    // In a real app this would send an email. Here we generate a reset code.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const idx = users.findIndex(u => u.id === found.id);
    users[idx].resetCode = code;
    users[idx].resetExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    saveUsers(users);
    return { success: true, code }; // code shown to user in demo mode
  }

  function confirmReset(email, code, newPassword) {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.email === email.toLowerCase());
    if (idx === -1) return { success: false, error: 'No account found.' };
    if (users[idx].resetCode !== code || Date.now() > users[idx].resetExpiry) {
      return { success: false, error: 'Invalid or expired reset code.' };
    }
    users[idx].password = hashPassword(newPassword);
    delete users[idx].resetCode;
    delete users[idx].resetExpiry;
    saveUsers(users);
    return { success: true };
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword, resetPassword, confirmReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
