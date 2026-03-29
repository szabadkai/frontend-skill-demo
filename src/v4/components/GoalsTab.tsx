import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { inferGoals } from '../../services/llm';
import { Trash2, Loader2, Play, GitBranch } from 'lucide-react';
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
      setErrorText('ERR: Missing API Key Configuration');
      return;
    }
    
    setErrorText('');
    setIsInferring(true);
    try {
      const generated = await inferGoals(openRouterApiKey, todos, goals, userProfile || '');
      setGoals([...goals, ...generated]);
    } catch (error: any) {
      console.error(error);
      setErrorText('ERR: Inference connection failed');
    } finally {
      setIsInferring(false);
    }
  };

  return (
    <div className="tab-container goals-tech">
      <div className="tab-header-tech">
        <h2 className="tab-title-tech mono-text">/goals</h2>
      </div>

      <div className="infer-section-tech">
        <div className="cmd-header mono-text">
          <span>&gt; AI.infer_goals(tasks)</span>
          <span className="text-muted">_</span>
        </div>
        <button 
          className="btn-tech w-full infer-btn-tech" 
          onClick={handleInfer}
          disabled={isInferring || todos.length === 0}
        >
          {isInferring ? (
            <span className="btn-content-tech">
              <Loader2 className="spin" size={16} />
              PROCESSING
            </span>
          ) : (
            <span className="btn-content-tech">
              <Play size={14} fill="currentColor" />
              RUN INFERENCE
            </span>
          )}
        </button>
        {errorText && <p className="error-text-tech mono-text">{errorText}</p>}
        {todos.length === 0 && !isInferring && (
          <p className="hint-text-tech mono-text">WARN: task_list is empty. Add tasks first.</p>
        )}
      </div>

      <form onSubmit={handleAdd} className="add-form-tech mt-2">
        <div className="input-wrap-tech">
          <span className="prompt-symbol mono-text">&gt;</span>
          <input
            type="text"
            className="input-tech prompt-input"
            placeholder="define_manual_goal..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button type="submit" className="submit-btn-tech" disabled={!newText.trim()}>
            <Play size={14} fill="currentColor" />
          </button>
        </div>
      </form>

      <div className="goals-wrapper-tech mt-4">
        <AnimatePresence mode="popLayout">
          {goals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-state-tech mono-text"
            >
              [ NULL ] - NO GOALS DECLARED
            </motion.div>
          )}

          {goals.map((goal, idx) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="goal-card-tech chrome-panel"
            >
              <div className="goal-card-header">
                <div className="goal-meta mono-text text-muted">
                  <span>OBJ_{String(idx).padStart(2, '0')}</span>
                  {goal.inferred && (
                    <span className="ai-tag-tech">
                      <GitBranch size={10} />
                      AUTO_INFERRED
                    </span>
                  )}
                </div>
                
                <button className="delete-btn-tech" onClick={() => deleteGoal(goal.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
              
              <h3 className="goal-heading-tech">{goal.text}</h3>
              
              <div className="goal-progress-tech">
                <div className="progress-bar-bg-tech">
                  <motion.div 
                    className="progress-fill-tech"
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  >
                    <div className="progress-glow"></div>
                  </motion.div>
                </div>
                <span className="progress-number-tech mono-text">
                  {String(Math.round(goal.progress)).padStart(3, '0')}%
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
