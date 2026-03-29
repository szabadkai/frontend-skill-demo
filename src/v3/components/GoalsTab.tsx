import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { fleshOutGoal } from '../../services/llm';
import { Trash2, Loader2, Sparkles, Plus, Check } from 'lucide-react';
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
    if (newText.trim()) { addGoal(newText.trim()); setNewText(''); }
  };

  const handleFleshOut = async () => {
    if (!openRouterApiKey) { setErrorText('Oops, please add an API key in Settings! 🔑'); return; }
    if (!expandedId) return;
    setErrorText('');
    setIsFleshingOut(true);
    try {
      const generated = await fleshOutGoal(openRouterApiKey, draftTitle, draftDesc, userProfile || '', (text) => setDraftDesc(text));
      setDraftDesc(generated);
    } catch (error: any) {
      console.error(error);
      setErrorText('Hmm, inference failed. Please check your key! ⚠️');
    } finally {
      setIsFleshingOut(false);
    }
  };

  return (
    <div className="tab-container goals-bubbly">
      <div className="tab-header-soft"><h2 className="tab-title-soft">Big Goals</h2></div>

      <form onSubmit={handleAdd} className="add-form-bubbly">
        <div className="input-wrap-bubbly">
          <input type="text" className="input-bubbly" placeholder="Add a new goal..." value={newText} onChange={(e) => setNewText(e.target.value)} />
          <button type="submit" className="bubbly-add-btn" disabled={!newText.trim()}><Plus size={24} strokeWidth={3} /></button>
        </div>
      </form>

      <div className="goals-wrapper-soft" style={{ position: 'relative' }}>
        {expandedId && (
           <div 
             style={{ position: 'fixed', inset: 0, zIndex: 10 }}
             onClick={(e) => { e.stopPropagation(); closeAndSave(); }}
           />
        )}
        <AnimatePresence mode="popLayout">
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
              className="goal-card-soft"
              style={{
                zIndex: isExpanded ? 20 : 1, 
                position: 'relative',
                cursor: isExpanded ? 'default' : 'pointer',
                transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isExpanded ? '0 10px 30px -5px rgba(236,72,153,0.3)' : ''
              }}
              onClick={() => { if (!isExpanded) toggleExpand(goal); }}
            >
              <div className="goal-content-top">
                <div className="goal-text-stack" style={{ flex: 1 }}>
                  {isExpanded ? (
                    <input 
                      autoFocus
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      readOnly={isFleshingOut}
                      className="goal-heading-soft"
                      style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: 0 }}
                    />
                  ) : (
                    <h3 className="goal-heading-soft">{goal.text}</h3>
                  )}
                  {goal.inferred && <span className="ai-tag-soft">AI SUGGESTION</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {totalLinked > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface-sunken)', color: 'var(--fg)', padding: '0.2rem 0.5rem', borderRadius: '12px', marginRight: '0.1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: completedTodos === totalLinked ? 'var(--success, #10b981)' : 'var(--accent)' }} />
                      {completedTodos}/{totalLinked}
                    </div>
                  ) : (
                   <div style={{ fontSize: '0.65rem', fontWeight: 600, background: 'transparent', color: 'rgba(0,0,0,0.3)', border: '2px dashed rgba(0,0,0,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', marginRight: '0.1rem' }}>
                      0 LINKED
                    </div>
                  )}
                  {isExpanded && (
                    <button className="delete-btn-soft" disabled={isFleshingOut} style={{ color: 'var(--success, #10b981)', background: 'rgba(16, 185, 129, 0.1)', opacity: isFleshingOut ? 0.5 : 1, padding: '0.4rem' }} onClick={(e) => { e.stopPropagation(); closeAndSave(); }}>
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                  )}
                  <button className="delete-btn-soft" disabled={isFleshingOut} style={{ opacity: isFleshingOut ? 0.5 : 1, padding: '0.4rem' }} onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}><Trash2 size={16} strokeWidth={2.5} /></button>
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
                      placeholder="Click ✨ AI Magic Spec to generate structured goals..."
                      style={{
                        width: '100%',
                        minHeight: '150px',
                        background: 'var(--surface-sunken)',
                        border: isFleshingOut ? '2px solid var(--accent)' : '2px solid transparent',
                        borderRadius: '16px',
                        padding: '1rem',
                        color: 'var(--fg)',
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
                      onClick={e => e.stopPropagation()}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', alignItems: 'center', gap: '1rem' }}>
                      {errorText && <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>{errorText}</span>}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleFleshOut(); }}
                        disabled={isFleshingOut}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        {isFleshingOut ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}
                        AI Magic Spec ✨
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
