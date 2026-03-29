import { useState } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { SquareTerminal, Database, Settings2 } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [[activeTab], setTab] = useState<[TabType, number]>(() => {
    const saved = localStorage.getItem('lastActiveTab') as TabType;
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

  const navItems = [
    { id: 'todos', label: '/tasks', icon: SquareTerminal },
    { id: 'goals', label: '/goals', icon: Database },
    { id: 'settings', label: '/config', icon: Settings2 },
  ] as const;

  const bind = useDrag(({ swipe: [swipeX] }) => {
    const currentIndex = navItems.findIndex(t => t.id === activeTab);
    if (swipeX === -1 && currentIndex < navItems.length - 1) {
      changeTab(navItems[currentIndex + 1].id, 1);
    } else if (swipeX === 1 && currentIndex > 0) {
      changeTab(navItems[currentIndex - 1].id, -1);
    }
  }, { swipe: { distance: 25, velocity: 0.15 } });

  return (
    <div className="app-container app-tech">
      <header className="app-header-tech" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserMenu />
          <h1 className="header-title-tech" style={{ margin: 0 }}>Workspace</h1>
          <div className="header-meta mono-text" style={{ marginLeft: '0.5rem' }}>V0.2.1 • ONLINE</div>
        </div>
      </header>
      
      <main className="main-content-tech" {...bind()} style={{ touchAction: 'pan-y' }}>
        <div className="tab-content-tech">
          <div className="vt-tab-container">
            {activeTab === 'todos' && <TodoTab />}
            {activeTab === 'goals' && <GoalsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </main>

      <div className="nav-wrapper-tech">
        <nav className="dock-tech">
          {navItems.map((item) => {
            const Icon = item.icon;
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
