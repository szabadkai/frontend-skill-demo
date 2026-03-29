import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { fleshOutGoal } from '../../services/llm';
import { Trash2, Loader2, Play, GitBranch, Check, Sparkles } from 'lucide-react';
import './GoalsTab.css';

export default function GoalsTab() {
  const { todos, goals, addGoal, deleteGoal, updateGoal, openRouterApiKey, userProfile } = useStore();
  const [newText, setNewText] = useState('');
  const [isFleshingOut, setIsFleshingOut] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');

  const openExpand = (goal: any) => {
    if (isFleshingOut) return;
    setExpandedId(goal.id);
    setDraftTitle(goal.text);
    setDraftDesc(goal.description || '');
  };

  const closeAndSave = () => {
    if (isFleshingOut) return;
    if (expandedId) {
      updateGoal(expandedId, { text: draftTitle, description: draftDesc });
      setExpandedId(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      addGoal(newText.trim());
      setNewText('');
    }
  };

  const handleFleshOut = async () => {
    if (!openRouterApiKey) {
      setErrorText('ERR: Missing API Key Configuration');
      return;
    }
    if (!expandedId) return;
    
    setErrorText('');
    setIsFleshingOut(true);
    try {
      const generated = await fleshOutGoal(openRouterApiKey, draftTitle, draftDesc, userProfile || '', (text) => setDraftDesc(text));
      setDraftDesc(generated);
    } catch (error: any) {
      console.error(error);
      setErrorText('ERR: Inference connection failed');
    } finally {
      setIsFleshingOut(false);
    }
  };

  return (
    <div className="tab-container goals-tech">
      <div className="tab-header-tech">
        <h2 className="tab-title-tech mono-text">/goals</h2>
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

      <div className="goals-wrapper-tech mt-4" style={{ position: 'relative' }}>
        {expandedId && (
           <div 
             style={{ position: 'fixed', inset: 0, zIndex: 10 }}
             onClick={(e) => { e.stopPropagation(); closeAndSave(); }}
           />
        )}
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

          {goals.map((goal, idx) => {
            const isExpanded = expandedId === goal.id;
            
            const linkedTodos = todos.filter(t => 
              t.linked_goals?.some(lg => lg.toLowerCase() === goal.text.toLowerCase().replace(/\s+/g, ''))
            );
            const completedTodos = linkedTodos.filter(t => t.completed).length;
            const totalLinked = linkedTodos.length;

            return (
            <motion.div
              layout
              key={goal.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="goal-card-tech chrome-panel"
              style={{
                zIndex: isExpanded ? 20 : 1, 
                position: 'relative',
                cursor: isExpanded ? 'default' : 'pointer',
                border: isExpanded ? '1px solid var(--accent-glow)' : '1px solid var(--border-tech)'
              }}
              onClick={() => { if (!isExpanded) openExpand(goal); }}
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
                
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {totalLinked > 0 ? (
                    <div className="mono-text" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: completedTodos === totalLinked ? 'var(--success, #10b981)' : 'var(--accent-glow)', background: 'rgba(0,0,0,0.5)', border: '1px solid currentColor', padding: '0.15rem 0.4rem', marginRight: '0.2rem' }}>
                      [{completedTodos}/{totalLinked}]
                    </div>
                  ) : (
                    <div className="mono-text" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'transparent', border: '1px dashed var(--text-muted)', padding: '0.15rem 0.4rem', marginRight: '0.2rem' }}>
                      [EMPTY]
                    </div>
                  )}
                  {isExpanded && (
                    <button className="delete-btn-tech" disabled={isFleshingOut} style={{ color: 'var(--success, #10b981)', opacity: isFleshingOut ? 0.5 : 1, padding: '0.2rem' }} onClick={(e) => { e.stopPropagation(); closeAndSave(); }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button className="delete-btn-tech" disabled={isFleshingOut} style={{ opacity: isFleshingOut ? 0.5 : 1, padding: '0.2rem' }} onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {isExpanded ? (
                <input 
                  autoFocus
                  readOnly={isFleshingOut}
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  className="goal-heading-tech"
                  style={{ background: 'transparent', border: 'none', color: 'var(--fg)', outline: 'none', width: '100%', padding: 0 }}
                />
              ) : (
                <h3 className="goal-heading-tech">{goal.text}</h3>
              )}
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '0.5rem', width: '100%', overflow: 'hidden' }}
                  >
                    <textarea 
                      value={draftDesc}
                      readOnly={isFleshingOut}
                      onChange={e => setDraftDesc(e.target.value)}
                      placeholder="/* Add technical specifications... */"
                      className="mono-text"
                      style={{
                        width: '100%',
                        minHeight: '150px',
                        background: 'rgba(0,0,0,0.3)',
                        border: isFleshingOut ? '1px solid var(--accent-glow)' : '1px solid var(--border-tech)',
                        padding: '1rem',
                        color: 'var(--fg-muted)',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        resize: 'vertical',
                        outline: 'none',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-glow)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-tech)'}
                      onClick={e => e.stopPropagation()}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', alignItems: 'center', gap: '1rem' }}>
                      {errorText && <span className="mono-text" style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>ERR: {errorText}</span>}
                      <button 
                        className="mono-text"
                        onClick={(e) => { e.stopPropagation(); handleFleshOut(); }}
                        disabled={isFleshingOut}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          background: 'rgba(0,0,0,0.5)', color: 'var(--accent-glow)', border: '1px solid var(--accent-glow)', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '1px'
                        }}
                      >
                        {isFleshingOut ? <Loader2 className="spin" size={12} /> : <Sparkles size={12} />}
                        RUN_AI_SPEC
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )})}
        </AnimatePresence>
      </div>
    </div>
  );
}
