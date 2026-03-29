import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Target, Settings } from 'lucide-react';
import TodoTab from './components/TodoTab';
import GoalsTab from './components/GoalsTab';
import SettingsTab from './components/SettingsTab';
import './App.css';

type TabType = 'todos' | 'goals' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('todos');

  const tabs = [
    { id: 'todos', label: 'Todos', icon: CheckCircle2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="app glass-bg">
      <header className="app-header">
        <h1>GoalMaster AI</h1>
      </header>

      <main className="main-content">
        <div className="tabs glass-panel">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
