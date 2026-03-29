import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, Settings } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [[activeTab], setTab] = useState<[TabType, number]>(() => {
    const saved = localStorage.getItem('lastActiveTab') as TabType;
    // ensure saved is a valid tab type
    if (saved === 'todos' || saved === 'goals' || saved === 'settings') {
      return [saved, 0];
    }
    return ['todos', 0];
  });

  const changeTab = (newTab: TabType) => {
    localStorage.setItem('lastActiveTab', newTab);
    setTab([newTab, 0]);
  };

  const tabs = [
    { id: 'todos', label: 'Todos', icon: CheckCircle2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const currentIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <div className="app glass-bg">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>GoalMaster AI</h1>
        <UserMenu />
      </header>

      <main className="main-content">
        <div className="tabs glass-panel">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab === tab.id) return;
                  changeTab(tab.id);
                }}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="active-indicator" />
                )}
              </button>
            );
          })}
        </div>

        <div className="tab-content" style={{ overflowX: 'hidden', width: '100%', position: 'relative' }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragDirectionLock
            onDragEnd={(_, { offset, velocity }) => {
              const swipeThreshold = 50;
              if (offset.x < -swipeThreshold || velocity.x < -500) {
                if (currentIndex < tabs.length - 1) changeTab(tabs[currentIndex + 1].id);
              } else if (offset.x > swipeThreshold || velocity.x > 500) {
                if (currentIndex > 0) changeTab(tabs[currentIndex - 1].id);
              }
            }}
            animate={{ x: `-${(currentIndex * 100) / tabs.length}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ display: 'flex', width: `${tabs.length * 100}%`, touchAction: 'pan-y' }}
          >
            <div style={{ width: `${100 / tabs.length}%`, flexShrink: 0 }}>
              <TodoTab />
            </div>
            <div style={{ width: `${100 / tabs.length}%`, flexShrink: 0 }}>
              <GoalsTab />
            </div>
            <div style={{ width: `${100 / tabs.length}%`, flexShrink: 0 }}>
              <SettingsTab />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
