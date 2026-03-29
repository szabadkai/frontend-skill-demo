import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SquareTerminal, Database, Settings2 } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('todos');

  const navItems = [
    { id: 'todos', label: '/tasks', icon: SquareTerminal },
    { id: 'goals', label: '/goals', icon: Database },
    { id: 'settings', label: '/config', icon: Settings2 },
  ] as const;

  return (
    <div className="app-container app-tech">
      <header className="app-header-tech" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserMenu />
          <h1 className="header-title-tech" style={{ margin: 0 }}>Workspace</h1>
          <div className="header-meta mono-text" style={{ marginLeft: '0.5rem' }}>V0.2.1 • ONLINE</div>
        </div>
      </header>
      
      <main className="main-content-tech">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.99, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.01, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="tab-content-tech"
          >
            {activeTab === 'todos' && <TodoTab />}
            {activeTab === 'goals' && <GoalsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="nav-wrapper-tech">
        <nav className="dock-tech">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`dock-item-tech ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                <div className="icon-wrap-tech">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`dock-label mono-text ${isActive ? 'active' : ''}`}>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="dock-indicator-tech"
                      className="dock-indicator-tech"
                      transition={{ type: "spring", stiffness: 600, damping: 30 }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default App;
