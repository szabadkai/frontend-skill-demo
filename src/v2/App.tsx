import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Target, Settings2 } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('todos');

  const navItems = [
    { id: 'todos', label: 'THE LIST', icon: Check },
    { id: 'goals', label: 'HORIZONS', icon: Target },
    { id: 'settings', label: 'SYSTEM', icon: Settings2 },
  ] as const;

  return (
    <div className="app-container app-editorial">
      <header className="app-header-editorial" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="title-stack">
          <h1 className="header-title font-serif">Objectives</h1>
          <span className="header-subtitle font-sans">Vol. I — Daily</span>
        </div>
        <UserMenu />
      </header>
      
      <main className="main-content-editorial">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="tab-content-editorial"
          >
            {activeTab === 'todos' && <TodoTab />}
            {activeTab === 'goals' && <GoalsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="nav-wrapper-editorial">
        <nav className="pill-dock">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`pill-item font-sans ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="pill-indicator-v2"
                    className="pill-indicator"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="pill-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default App;
