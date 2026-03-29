import { useState } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { Check, Target, Settings2 } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [[activeTab], setTab] = useState<[TabType, number]>(['todos', 0]);

  const changeTab = (newTab: TabType, dir: number) => {
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

  const navItems = [
    { id: 'todos', label: 'THE LIST', icon: Check },
    { id: 'goals', label: 'HORIZONS', icon: Target },
    { id: 'settings', label: 'SYSTEM', icon: Settings2 },
  ] as const;

  const bind = useDrag(({ swipe: [swipeX] }) => {
    const currentIndex = navItems.findIndex(t => t.id === activeTab);
    if (swipeX === -1 && currentIndex < navItems.length - 1) {
      changeTab(navItems[currentIndex + 1].id, 1);
    } else if (swipeX === 1 && currentIndex > 0) {
      changeTab(navItems[currentIndex - 1].id, -1);
    }
  }, { swipe: { distance: 40, velocity: 0.3 } });

  return (
    <div className="app-container app-editorial">
      <header className="app-header-editorial" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="title-stack">
          <h1 className="header-title font-serif">Objectives</h1>
          <span className="header-subtitle font-sans">Vol. I — Daily</span>
        </div>
        <UserMenu />
      </header>
      
      <main className="main-content-editorial" {...bind()} style={{ touchAction: 'pan-y' }}>
        <div className="tab-content-editorial">
          <div className="vt-tab-container">
            {activeTab === 'todos' && <TodoTab />}
            {activeTab === 'goals' && <GoalsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </main>

      <div className="nav-wrapper-editorial">
        <nav className="pill-dock">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (activeTab === item.id) return;
                  const currentIndex = navItems.findIndex(t => t.id === activeTab);
                  const nextIndex = navItems.findIndex(t => t.id === item.id);
                  changeTab(item.id, nextIndex > currentIndex ? 1 : -1);
                }}
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
