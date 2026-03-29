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
  const [[activeTab, direction], setTab] = useState<[TabType, number]>(['todos', 0]);

  const changeTab = (newTab: TabType, dir: number) => {
    setTab([newTab, dir]);
  };

  const navItems = [
    { id: 'todos', label: 'Tasks', icon: CheckCircle2 },
    { id: 'goals', label: 'Goals', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
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
    <div className="app-container app-playful">
      <header className="app-header-soft" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="header-title-soft">Welcome back! 👋</h1>
          <p className="app-subtitle-soft">Let's get things done today.</p>
        </div>
        <UserMenu />
      </header>
      
      <main className="main-content-soft" {...bind()} style={{ touchAction: 'pan-y' }}>
        <div className="tab-content-soft" style={{ overflowX: 'hidden' }}>
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

      <div className="nav-wrapper-bubbly">
        <nav className="bubbly-dock">
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
