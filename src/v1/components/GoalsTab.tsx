import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { inferGoals } from '../../services/llm';
import { Trash2, Loader2, Target } from 'lucide-react';
import './GoalsTab.css';

export default function GoalsTab() {
  const { todos, goals, addGoal, deleteGoal, setGoals, openRouterApiKey, userProfile } = useStore();
  const [newText, setNewText] = useState('');
  const [isInferring, setIsInferring] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      addGoal(newText.trim());
      setNewText('');
    }
  };

  const handleInfer = async () => {
    if (!openRouterApiKey) {
      setErrorText('Please specify an API key in Settings.');
      return;
    }
    setErrorText('');
    setIsInferring(true);
    try {
      const generated = await inferGoals(openRouterApiKey, todos, goals, userProfile || '');
      setGoals([...goals, ...generated]);
    } catch (error: any) {
      console.error(error);
      setErrorText('Inference failed. Check API key.');
    } finally {
      setIsInferring(false);
    }
  };

  return (
    <div className="tab-container goals-v1">
      <div className="infer-section glass-panel">
        <button className="btn-primary w-full" onClick={handleInfer} disabled={isInferring || todos.length === 0}>
           {isInferring ? <Loader2 className="spin" size={18} /> : <span>Infer Goals via AI</span>}
        </button>
        {errorText && <p className="error-text">{errorText}</p>}
      </div>

      <form onSubmit={handleAdd} className="add-form glass-panel">
        <input
          type="text"
          className="input-glass"
          placeholder="Add a new goal..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button type="submit" className="add-btn btn-primary" disabled={!newText.trim()}>
          <Target size={20} />
        </button>
      </form>

      <div className="goals-wrapper">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div key={goal.id} className="goal-card glass-panel">
              <div className="goal-header">
                <h3>{goal.text}</h3>
                <button className="del-btn" onClick={() => deleteGoal(goal.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="progress-bar-bg">
                <motion.div className="progress-fill" style={{width: `${goal.progress}%`}} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
