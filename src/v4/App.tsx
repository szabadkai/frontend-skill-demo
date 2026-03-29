import { useState } from 'react';
import { motion } from 'framer-motion';
import { SquareTerminal, Database, Settings2 } from 'lucide-react';
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
    { id: 'todos', label: '/tasks', icon: SquareTerminal },
    { id: 'goals', label: '/goals', icon: Database },
    { id: 'settings', label: '/config', icon: Settings2 },
  ] as const;

  const currentIndex = navItems.findIndex(t => t.id === activeTab);

  return (
    <div className="app-container app-tech">
      <header className="app-header-tech" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserMenu />
          <h1 className="header-title-tech" style={{ margin: 0 }}>Workspace</h1>
          <div className="header-meta mono-text" style={{ marginLeft: '0.5rem' }}>V0.2.1 • ONLINE</div>
        </div>
      </header>
      
      <main className="main-content-tech" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="tab-content-tech" style={{ overflowX: 'hidden', width: '100%', position: 'relative', flex: 1 }}>
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
            style={{ display: 'flex', width: `${navItems.length * 100}%`, height: '100%', touchAction: 'pan-y' }}
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

      <div className="nav-wrapper-tech">
        <nav className="dock-tech">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (activeTab === item.id) return;
                  changeTab(item.id);
                }}
                className={`dock-item-tech ${activeTab === item.id ? 'active' : ''}`}
                aria-label={item.label}
              >
                <div className="icon-wrap-tech">
                  <Icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  <span className={`dock-label mono-text ${activeTab === item.id ? 'active' : ''}`}>{item.label}</span>
                  {activeTab === item.id && (
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
