import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { Check, Target, Settings2 } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import UserMenu from '../components/UserMenu';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [[activeTab, direction], setTab] = useState<[TabType, number]>(['todos', 0]);

  const changeTab = (newTab: TabType, dir: number) => {
    setTab([newTab, dir]);
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

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98
    })
  };

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
        <div className="tab-content-editorial" style={{ overflowX: 'hidden' }}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            >
              {activeTab === 'todos' && <TodoTab />}
              {activeTab === 'goals' && <GoalsTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
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
