import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { inferGoals } from '../../services/llm';
import { Trash2, Loader2, Sparkles, Plus } from 'lucide-react';
import './GoalsTab.css';

export default function GoalsTab() {
  const { todos, goals, addGoal, deleteGoal, setGoals, openRouterApiKey } = useStore();
  const [newText, setNewText] = useState('');
  const [isInferring, setIsInferring] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) { addGoal(newText.trim()); setNewText(''); }
  };

  const handleInfer = async () => {
    if (!openRouterApiKey) { setErrorText('Oops, please add an API key in Settings! 🔑'); return; }
    setErrorText(''); setIsInferring(true);
    try {
      const generated = await inferGoals(openRouterApiKey, todos, goals);
      setGoals([...goals, ...generated]);
    } catch (error: any) { setErrorText('Hmm, inference failed. Please check your key! ⚠️'); } 
    finally { setIsInferring(false); }
  };

  return (
    <div className="tab-container goals-bubbly">
      <div className="tab-header-soft"><h2 className="tab-title-soft">Big Goals</h2></div>

      <div className="infer-section-fun">
        <button className="btn-bubbly w-full magic-btn" onClick={handleInfer} disabled={isInferring || todos.length === 0}>
          {isInferring ? (
            <span className="btn-content"><Loader2 className="spin" size={24} strokeWidth={3} /> MAGIC...</span>
          ) : (
            <span className="btn-content"><Sparkles size={24} strokeWidth={2.5} /> AI INFER GOALS</span>
          )}
        </button>
        {errorText && <p className="error-text-soft">{errorText}</p>}
      </div>

      <form onSubmit={handleAdd} className="add-form-bubbly">
        <div className="input-wrap-bubbly">
          <input type="text" className="input-bubbly" placeholder="Add a new goal..." value={newText} onChange={(e) => setNewText(e.target.value)} />
          <button type="submit" className="bubbly-add-btn" disabled={!newText.trim()}><Plus size={24} strokeWidth={3} /></button>
        </div>
      </form>

      <div className="goals-wrapper-soft">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => (
            <motion.div key={goal.id} className="goal-card-soft">
              <div className="goal-content-top">
                <div className="goal-text-stack">
                  <h3 className="goal-heading-soft">{goal.text}</h3>
                  {goal.inferred && <span className="ai-tag-soft">AI SUGGESTION</span>}
                </div>
                <button className="delete-btn-soft" onClick={() => deleteGoal(goal.id)}><Trash2 size={20} strokeWidth={2.5} /></button>
              </div>
              
              <div className="goal-progress-fat">
                <div className="progress-bar-bg-fat">
                  <motion.div className="progress-fill-gradient" animate={{ width: `${goal.progress}%` }} />
                </div>
                <span className="progress-number-soft">{Math.round(goal.progress)}%</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
