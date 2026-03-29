import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Plus, X, Check, GripVertical, Loader2, Wand2, ListPlus } from 'lucide-react';
import AutocompleteInput from '../../components/AutocompleteInput';
import ParsedText from '../../components/ParsedText';
import { inferTodos } from '../../services/llm';
import './TodoTab.css';

export default function TodoTab() {
  const { todos, goals, openRouterApiKey, userProfile, addTodo, toggleTodo, deleteTodo, reorderTodos, editTodo } = useStore();
  const [newText, setNewText] = useState('');
  
  const [inferenceMode, setInferenceMode] = useState<'hidden' | 'select-goal' | 'loading' | 'select-tasks'>('hidden');
  const [suggestedTasks, setSuggestedTasks] = useState<Array<{text: string, selected: boolean}>>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEditSubmit = () => {
    if (editingId && editText.trim()) {
      editTodo(editingId, editText.trim());
    }
    setEditingId(null);
  };
  


  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      addTodo(newText.trim());
      setNewText('');
    }
  };

  const handleWandClick = () => {
    if (!openRouterApiKey) { alert('Hey! Drop your API key in the settings first. ✨'); return; }
    if (goals.length === 0) { alert('You need to add a goal before I can suggest tasks! 🎯'); return; }
    setInferenceMode('select-goal');
  };

  const handleGoalSelect = async (goalId: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;
    
    setInferenceMode('loading');
    
    try {
      const suggestions = await inferTodos(openRouterApiKey, todos, targetGoal, userProfile || '');
      const tag = `@${targetGoal.text.replace(/\s+/g, '')}`;
      setSuggestedTasks(suggestions.map(s => ({ text: `${s.text} ${tag}`, selected: true })));
      setInferenceMode('select-tasks');
    } catch {
      alert('Oops! The magic fizzled out. Try again!');
      setInferenceMode('hidden');
    }
  };

  const toggleSuggestion = (index: number) => {
    setSuggestedTasks(prev => prev.map((t, i) => i === index ? { ...t, selected: !t.selected } : t));
  };

  const handleAddSelected = () => {
    suggestedTasks.filter(t => t.selected).forEach(t => addTodo(t.text));
    setInferenceMode('hidden');
    setSuggestedTasks([]);
  };

  const pendingCount = todos.filter(t => !t.completed).length;

  return (
    <div className="tab-container todo-bubbly">
      <div className="tab-header-soft">
        <h2 className="tab-title-soft">My Tasks</h2>
        {pendingCount > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="count-badge-soft">
            {pendingCount} Left
          </motion.span>
        )}
      </div>

      <form onSubmit={handleAdd} className="add-form-bubbly">
        <div className="input-wrap-bubbly">
          <AutocompleteInput
            className="input-bubbly-main"
            placeholder="Add a fun new task!"
            value={newText}
            onChange={setNewText}
            onSubmit={() => {
              if (newText.trim()) {
                addTodo(newText.trim());
                setNewText('');
              }
            }}
            style={{ paddingRight: goals.length > 0 ? '5rem' : '3.5rem' }}
          />
          {goals.length > 0 && (
            <button type="button" onClick={handleWandClick} className="wand-btn-bubbly" disabled={inferenceMode !== 'hidden'} title="Magic Task Suggestion">
              <Wand2 size={20}/>
            </button>
          )}
          <button type="submit" className="bubbly-add-btn" disabled={!newText.trim()}>
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </form>

      {inferenceMode !== 'hidden' && (
        <div className="todo-row-soft" style={{ padding: '1.5rem', marginTop: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {inferenceMode === 'select-goal' && '✨ Choose a Goal'}
              {inferenceMode === 'loading' && '🪄 Conjuring Magic...'}
              {inferenceMode === 'select-tasks' && '🌟 Look at these ideas!'}
            </h3>
            <button onClick={() => setInferenceMode('hidden')} className="delete-btn-soft" style={{ background: 'var(--surface-border)' }}>
              <X size={20} />
            </button>
          </div>

          {inferenceMode === 'select-goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {goals.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => handleGoalSelect(g.id)}
                  style={{ textAlign: 'left', padding: '1rem 1.25rem', background: 'var(--bg-color)', border: '2px solid var(--surface-border)', borderRadius: 'var(--radius-main)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', transition: 'all 0.2s', fontWeight: 600, fontSize: '1.1rem' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.transform = 'scale(1.02)' }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <span>{g.text}</span>
                  <span style={{ color: 'var(--accent)' }}>{g.progress}%</span>
                </button>
              ))}
            </div>
          )}

          {inferenceMode === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', color: 'var(--accent)' }}>
              <Loader2 size={40} className="spin" strokeWidth={3} />
            </div>
          )}

          {inferenceMode === 'select-tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {suggestedTasks.map((task, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', padding: '1rem', background: task.selected ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-color)', borderRadius: '1rem', border: task.selected ? '3px solid var(--accent-light)' : '3px solid var(--surface-border)', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  <input 
                    type="checkbox" 
                    checked={task.selected} 
                    onChange={() => toggleSuggestion(idx)}
                    style={{ marginTop: '0.3rem', width: '1.5rem', height: '1.5rem', accentColor: 'var(--accent)' }} 
                  />
                  <span style={{ fontSize: '1.1rem', fontWeight: task.selected ? 700 : 500, color: 'var(--text-primary)' }}>{task.text}</span>
                </label>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button onClick={handleAddSelected} className="btn-bubbly" disabled={!suggestedTasks.some(t => t.selected)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ListPlus size={20} strokeWidth={3} /> POP INTO LIST
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="todos-wrapper-soft">
        <Reorder.Group axis="y" values={todos} onReorder={reorderTodos} className="todo-list-bubbly">
          <AnimatePresence mode="popLayout">
            {todos.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="empty-state-bubbly">
                <div className="empty-circle">🚀</div>
                <p>All clear! Relax or add a new task.</p>
              </motion.div>
            )}
            
            {todos.map((todo) => (
              <Reorder.Item
                key={todo.id} value={todo}
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className={`todo-row-soft ${todo.completed ? 'is-done-soft' : ''}`} 
              >
                <div className="todo-content-bubbly">
                  <div className="drag-handle-soft"><GripVertical size={20} strokeWidth={2} className="grip-icon-soft" /></div>
                  <button className={`bouncy-checkbox ${todo.completed ? 'checked-soft' : ''}`} onClick={() => toggleTodo(todo.id)} aria-label="Toggle Complete">
                    <AnimatePresence>
                      {todo.completed && (
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 45 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                          <Check size={16} strokeWidth={4} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  {editingId === todo.id ? (
                    <AutocompleteInput
                      autoFocus
                      className="input-bubbly"
                      style={{ flex: 1, padding: '0.25rem 1rem' }}
                      value={editText}
                      onChange={setEditText}
                      onBlur={handleEditSubmit}
                      onSubmit={handleEditSubmit}
                    />
                  ) : (
                    <span 
                      className="todo-text-soft" 
                      onDoubleClick={() => handleEditStart(todo.id, todo.text)}
                      style={{ cursor: 'text' }}
                    >
                      <ParsedText text={todo.text} />
                    </span>
                  )}
                  <button className="delete-btn-soft" onClick={() => deleteTodo(todo.id)}>
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}
