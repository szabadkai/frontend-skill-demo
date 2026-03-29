import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { fleshOutGoal } from '../../services/llm';
import { Trash2, Loader2, ArrowRight, Check, Sparkles } from 'lucide-react';
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
    if (!openRouterApiKey) { setErrorText('Specify an API key in Settings.'); return; }
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
    <div className="tab-container goals-elegant">
      <div className="tab-header">
        <h2 className="font-serif tab-title">Horizons</h2>
      </div>

      <form onSubmit={handleAdd} className="add-form-minimal">
        <div className="input-wrap">
          <input type="text" className="input-underline font-serif" placeholder="Define a new horizon..."
            value={newText} onChange={(e) => setNewText(e.target.value)} />
          <button type="submit" className="circle-btn submit-btn" disabled={!newText.trim()}><ArrowRight size={18} /></button>
        </div>
      </form>

      <div className="goals-wrapper-elegant" style={{ position: 'relative' }}>
        {expandedId && (
           <div 
             style={{ position: 'fixed', inset: 0, zIndex: 10 }}
             onClick={(e) => { e.stopPropagation(); closeAndSave(); }}
           />
        )}
        <AnimatePresence>
          {goals.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="empty-state-elegant">
              <p>No horizons set.</p>
            </motion.div>
          )}

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
              className="goal-card-editorial"
              style={{
                zIndex: isExpanded ? 20 : 1, 
                position: 'relative',
                cursor: isExpanded ? 'default' : 'pointer',
                borderColor: isExpanded ? 'var(--fg)' : ''
              }}
              onClick={() => { if (!isExpanded) toggleExpand(goal); }}
            >
              <div className="goal-content-main">
                <div className="goal-text-wrap" style={{ flex: 1 }}>
                  {goal.inferred && <span className="ai-tag font-sans">INFERRED</span>}
                  {isExpanded ? (
                    <input 
                      autoFocus
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      className="goal-heading font-serif"
                      style={{ background: 'transparent', border: 'none', color: 'var(--fg)', outline: 'none', width: '100%', padding: 0 }}
                    />
                  ) : (
                    <h3 className="goal-heading font-serif">{goal.text}</h3>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {totalLinked > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.5px', border: '1px solid var(--border)', padding: '0.15rem 0.4rem', borderRadius: '8px', marginRight: '0.2rem' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: completedTodos === totalLinked ? 'var(--success, #10b981)' : 'var(--fg)' }} />
                      {completedTodos}/{totalLinked}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.5px', color: 'var(--border)', border: '1px dashed var(--border)', padding: '0.15rem 0.4rem', borderRadius: '8px', marginRight: '0.2rem' }}>
                      0 LINKED
                    </div>
                  )}
                  {isExpanded && (
                    <button className="icon-btn" disabled={isFleshingOut} style={{ color: 'var(--success, #10b981)', opacity: isFleshingOut ? 0.5 : 1, padding: '0.2rem' }} onClick={(e) => { e.stopPropagation(); closeAndSave(); }}>
                      <Check size={16} />
                    </button>
                  )}
                  <button className="icon-btn delete-goal" disabled={isFleshingOut} style={{ opacity: isFleshingOut ? 0.5 : 1, padding: '0.2rem' }} onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}><Trash2 size={16} /></button>
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
                      placeholder="Flesh out this horizon..."
                      readOnly={isFleshingOut}
                      className="font-serif"
                      style={{
                        width: '100%',
                        minHeight: '150px',
                        background: isFleshingOut ? 'var(--surface-sunken)' : 'transparent',
                        border: isFleshingOut ? '1px solid var(--fg)' : '1px solid var(--border)',
                        padding: '1rem',
                        color: 'var(--fg)',
                        fontSize: '1.05rem',
                        lineHeight: '1.6',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', alignItems: 'center', gap: '1rem' }}>
                        {errorText && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>{errorText}</span>}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleFleshOut(); }}
                          disabled={isFleshingOut}
                          className="font-sans"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px'
                          }}
                        >
                          {isFleshingOut ? <Loader2 className="spin" size={14} /> : <Sparkles size={14} />}
                          AI FLESH OUT
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
