import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { inferGoals } from '../../services/llm';
import { Trash2, Loader2, ArrowRight } from 'lucide-react';
import './GoalsTab.css';

export default function GoalsTab() {
  const { todos, goals, addGoal, deleteGoal, setGoals, openRouterApiKey } = useStore();
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
    if (!openRouterApiKey) { setErrorText('Specify an API key in System.'); return; }
    setErrorText(''); setIsInferring(true);
    try {
      const generated = await inferGoals(openRouterApiKey, todos, goals);
      setGoals([...goals, ...generated]);
    } catch (error: any) { setErrorText('Inference failed. Verify your key.'); } 
    finally { setIsInferring(false); }
  };

  return (
    <div className="tab-container goals-elegant">
      <div className="tab-header">
        <h2 className="font-serif tab-title">Horizons</h2>
      </div>

      <div className="infer-section">
        <button className="btn-brutal w-full font-sans" onClick={handleInfer} disabled={isInferring || todos.length === 0}>
          {isInferring ? (
            <span className="btn-content"><Loader2 className="spin" size={18} /> ANALYZING</span>
          ) : (
            <span className="btn-content">INFER GOALS <ArrowRight size={18} /></span>
          )}
        </button>
        {errorText && <p className="error-text-elegant">{errorText}</p>}
      </div>

      <form onSubmit={handleAdd} className="add-form-minimal">
        <div className="input-wrap">
          <input type="text" className="input-underline font-serif" placeholder="Define a new horizon..."
            value={newText} onChange={(e) => setNewText(e.target.value)} />
          <button type="submit" className="circle-btn submit-btn" disabled={!newText.trim()}><ArrowRight size={18} /></button>
        </div>
      </form>

      <div className="goals-wrapper-elegant">
        <AnimatePresence>
          {goals.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="empty-state-elegant">
              <p>No horizons set.</p>
            </motion.div>
          )}

          {goals.map((goal) => (
            <motion.div key={goal.id} className="goal-card-editorial">
              <div className="goal-content-main">
                <div className="goal-text-wrap">
                  {goal.inferred && <span className="ai-tag font-sans">INFERRED</span>}
                  <h3 className="goal-heading font-serif">{goal.text}</h3>
                </div>
                <button className="icon-btn delete-goal" onClick={() => deleteGoal(goal.id)}><Trash2 size={18} /></button>
              </div>
              
              <div className="goal-progress-massive">
                <div className="progress-watermark font-serif">{Math.round(goal.progress)}%</div>
                <div className="progress-bar-thin"><motion.div className="progress-fill-thin" animate={{ width: `${goal.progress}%` }} /></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
