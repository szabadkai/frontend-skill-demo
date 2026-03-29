import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { CheckCircle2, PieChart, Settings } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('todos');

  const navItems = [
    { id: 'todos', label: 'Tasks', icon: CheckCircle2 },
    { id: 'goals', label: 'Goals', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const bind = useDrag(({ swipe: [swipeX] }) => {
    const currentIndex = navItems.findIndex(t => t.id === activeTab);
    if (swipeX === -1 && currentIndex < navItems.length - 1) {
      setActiveTab(navItems[currentIndex + 1].id);
    } else if (swipeX === 1 && currentIndex > 0) {
      setActiveTab(navItems[currentIndex - 1].id);
    }
  }, { swipe: { distance: 40, velocity: 0.3 } });

  return (
    <div className="app-container app-playful">
      <header className="app-header-soft" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="header-title-soft">Welcome back! 👋</h1>
          <p className="app-subtitle-soft">Let's get things done today.</p>
        </div>
        <UserMenu />
      </header>
      
      <main className="main-content-soft" {...bind()} style={{ touchAction: 'pan-y' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="tab-content-soft"
          >
            {activeTab === 'todos' && <TodoTab />}
            {activeTab === 'goals' && <GoalsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="nav-wrapper-bubbly">
        <nav className="bubbly-dock">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`bubbly-item ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                <div className="icon-wrap-bubbly">
                  <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="bubbly-indicator-v3"
                      className="bubbly-indicator"
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
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
