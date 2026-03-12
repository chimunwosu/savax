import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import Income from './components/income/Income';
import Expenses from './components/expenses/Expenses';
import Investments from './components/investments/Investments';
import Goals from './components/goals/Goals';
import DebtPayoff from './components/debt/DebtPayoff';
import Calculator from './components/calculator/Calculator';
import NetWorth from './components/networth/NetWorth';
import Reports from './components/reports/Reports';
import Advisor from './components/advisor/Advisor';
import Settings from './components/settings/Settings';
import './styles/index.css';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/debt" element={<DebtPayoff />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/networth" element={<NetWorth />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/advisor" element={<Advisor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
