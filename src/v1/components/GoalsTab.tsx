import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { fleshOutGoal } from '../../services/llm';
import { Trash2, Loader2, Target, Check, Sparkles } from 'lucide-react';
import './GoalsTab.css';

export default function GoalsTab() {
  const { todos, goals, addGoal, deleteGoal, updateGoal, openRouterApiKey, userProfile } = useStore();
  const [newText, setNewText] = useState('');
  const [isFleshingOut, setIsFleshingOut] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');

  const toggleExpand = (goal: any) => {
    if (isFleshingOut) return;
    if (expandedId === goal.id) {
      setExpandedId(null);
    } else {
      setExpandedId(goal.id);
      setDraftTitle(goal.text);
      setDraftDesc(goal.description || '');
    }
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
    if (!openRouterApiKey) { setErrorText('Please specify an API key in Settings.'); return; }
    if (!expandedId) return;
    setErrorText('');
    setIsFleshingOut(true);
    try {
      const generated = await fleshOutGoal(openRouterApiKey, draftTitle, draftDesc, userProfile || '', (text) => setDraftDesc(text));
      setDraftDesc(generated);
    } catch (error: any) {
      console.error(error);
      setErrorText('AI expansion failed.');
    } finally {
      setIsFleshingOut(false);
    }
  };

  return (
    <div className="tab-container goals-v1">
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

      <div className="goals-wrapper" style={{ position: 'relative' }}>
        {expandedId && (
           <div 
             style={{ position: 'fixed', inset: 0, zIndex: 10 }}
             onClick={(e) => { e.stopPropagation(); closeAndSave(); }}
           />
        )}
        <AnimatePresence>
          {goals.map((goal) => {
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
                className={`goal-card glass-panel`}
                style={{ 
                  zIndex: isExpanded ? 20 : 1, 
                  position: 'relative',
                  cursor: isExpanded ? 'default' : 'pointer',
                  boxShadow: isExpanded ? '0 0 0 2px var(--accent)' : ''
                }}
                onClick={() => { if (!isExpanded) toggleExpand(goal); }}
              >
                <div className="goal-header" style={{ marginBottom: isExpanded ? '0.4rem' : 0 }}>
                  {isExpanded ? (
                    <input 
                       autoFocus
                       value={draftTitle}
                       onChange={e => setDraftTitle(e.target.value)}
                       readOnly={isFleshingOut}
                       style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 600, outline: 'none', flex: 1 }}
                    />
                  ) : (
                    <h3 style={{ flex: 1 }}>{goal.text}</h3>
                  )}
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    {totalLinked > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.4rem', borderRadius: '8px', marginRight: '0.2rem' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: completedTodos === totalLinked ? 'var(--success)' : 'var(--accent)' }} />
                        {completedTodos}/{totalLinked}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', padding: '0.15rem 0.4rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginRight: '0.2rem' }}>
                        0 linked
                      </div>
                    )}
                    {isExpanded && (
                      <button className="del-btn" disabled={isFleshingOut} style={{ color: 'var(--success)', opacity: isFleshingOut ? 0.5 : 1, padding: '0.2rem' }} onClick={(e) => { e.stopPropagation(); closeAndSave(); }}>
                        <Check size={14} />
                      </button>
                    )}
                    <button className="del-btn" disabled={isFleshingOut} style={{ opacity: isFleshingOut ? 0.5 : 1, padding: '0.2rem' }} onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '1rem', width: '100%', overflow: 'hidden' }}
                    >
                      <textarea 
                        value={draftDesc}
                        onChange={e => setDraftDesc(e.target.value)}
                        readOnly={isFleshingOut}
                        placeholder="Click ✨ AI Auto-Flesh to generate a structured spec..."
                        style={{
                          width: '100%',
                          minHeight: '150px',
                          background: isFleshingOut ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)',
                          border: isFleshingOut ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: 'rgba(255,255,255,0.9)',
                          fontFamily: 'inherit',
                          fontSize: '0.9rem',
                          lineHeight: '1.5',
                          resize: 'vertical',
                          outline: 'none'
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', alignItems: 'center', gap: '1rem' }}>
                        {errorText && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errorText}</span>}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleFleshOut(); }}
                          disabled={isFleshingOut}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(255,255,255,0.1)', color: 'var(--accent)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.2s'
                          }}
                        >
                          {isFleshingOut ? <Loader2 className="spin" size={14} /> : <Sparkles size={14} />}
                          AI Auto-Flesh
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
