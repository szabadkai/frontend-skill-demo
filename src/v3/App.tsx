import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, PieChart, Settings } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [activeTab, setTab] = useState<TabType>(() => (localStorage.getItem('lastActiveTab') as TabType) || 'todos');

  const changeTab = (newTab: TabType) => {
    localStorage.setItem('lastActiveTab', newTab);
    setTab(newTab);
  };

  const navItems = [
    { id: 'todos', label: 'Tasks', icon: CheckCircle2 },
    { id: 'goals', label: 'Goals', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const currentIndex = navItems.findIndex(t => t.id === activeTab);

  return (
    <div className="app-container app-playful">
      <header className="app-header-soft" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="header-title-soft">Welcome back! 👋</h1>
          <p className="app-subtitle-soft">Let's get things done today.</p>
        </div>
        <UserMenu />
      </header>
      
      <main className="main-content-soft">
        <div className="tab-content-soft" style={{ overflowX: 'hidden', width: '100%', position: 'relative' }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragDirectionLock
            onDragEnd={(_, { offset, velocity }) => {
              const swipeThreshold = 50;
              if (offset.x < -swipeThreshold || velocity.x < -500) {
                if (currentIndex < navItems.length - 1) changeTab(navItems[currentIndex + 1].id);
              } else if (offset.x > swipeThreshold || velocity.x > 500) {
                if (currentIndex > 0) changeTab(navItems[currentIndex - 1].id);
              }
            }}
            animate={{ x: `-${(currentIndex * 100) / navItems.length}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ display: 'flex', width: `${navItems.length * 100}%`, touchAction: 'pan-y' }}
          >
            <div style={{ width: `${100 / navItems.length}%`, flexShrink: 0 }}>
              <TodoTab />
            </div>
            <div style={{ width: `${100 / navItems.length}%`, flexShrink: 0 }}>
              <GoalsTab />
            </div>
            <div style={{ width: `${100 / navItems.length}%`, flexShrink: 0 }}>
              <SettingsTab />
            </div>
          </motion.div>
        </div>
      </main>

      <div className="nav-wrapper-bubbly">
        <nav className="bubbly-dock">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (activeTab === item.id) return;
                  changeTab(item.id);
                }}
                className={`bubbly-item ${activeTab === item.id ? 'active' : ''}`}
                aria-label={item.label}
              >
                <div className="icon-wrap-bubbly">
                  <Icon size={24} strokeWidth={activeTab === item.id ? 3 : 2} />
                  {activeTab === item.id && (
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
