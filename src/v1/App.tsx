import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { CheckCircle2, Target, Settings } from 'lucide-react';
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

        <div className="tab-content" style={{ overflowX: 'hidden' }}>
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
    </div>
  );
}

export default App;
