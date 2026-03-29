import { useState } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
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

  const changeTab = (newTab: TabType, dir: number) => {
    localStorage.setItem('lastActiveTab', newTab);
    if (!document.startViewTransition) {
      setTab([newTab, dir]);
      return;
    }

    document.documentElement.classList.remove('back-transition');
    if (dir < 0) {
      document.documentElement.classList.add('back-transition');
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setTab([newTab, dir]);
      });
    });
  };

  const tabs = [
    { id: 'todos', label: 'Todos', icon: CheckCircle2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const bind = useDrag(({ swipe: [swipeX] }) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (swipeX === -1 && currentIndex < tabs.length - 1) {
      changeTab(tabs[currentIndex + 1].id, 1);
    } else if (swipeX === 1 && currentIndex > 0) {
      changeTab(tabs[currentIndex - 1].id, -1);
    }
  }, { swipe: { distance: 40, velocity: 0.3 } });

  return (
    <div className="app glass-bg">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>GoalMaster AI</h1>
        <UserMenu />
      </header>

      <main className="main-content" {...bind()} style={{ touchAction: 'pan-y' }}>
        <div className="tabs glass-panel">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab === tab.id) return;
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  const nextIndex = tabs.findIndex(t => t.id === tab.id);
                  changeTab(tab.id, nextIndex > currentIndex ? 1 : -1);
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

        <div className="tab-content">
          <div className="vt-tab-container">
            {activeTab === 'todos' && <TodoTab />}
            {activeTab === 'goals' && <GoalsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
