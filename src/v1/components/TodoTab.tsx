import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Check, Loader2, Wand2, X } from 'lucide-react';
import AutocompleteInput from '../../components/AutocompleteInput';
import ParsedText from '../../components/ParsedText';
import { inferTodos } from '../../services/llm';
import './TodoTab.css';

export default function TodoTab() {
  const { todos, goals, openRouterApiKey, userProfile, addTodo, toggleTodo, deleteTodo, reorderTodos, editTodo } = useStore();
  const [newText, setNewText] = useState('');
  
  const [inferenceMode, setInferenceMode] = useState<'hidden' | 'select-goal' | 'loading' | 'select-tasks'>('hidden');
  const [suggestedTasks, setSuggestedTasks] = useState<Array<{text: string, selected: boolean}>>([]);
  
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const now = new Date();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => {
    if (!t.completed) return false;
    const ageMs = now.getTime() - new Date(t.created_at).getTime();
    return ageMs <= THIRTY_DAYS_MS;
  });
  const archivedTodos = todos.filter(t => {
    if (!t.completed) return false;
    const ageMs = now.getTime() - new Date(t.created_at).getTime();
    return ageMs > THIRTY_DAYS_MS;
  });

  const handleReorder = (newActiveOrder: typeof todos) => {
    // Preserve completed and archived items when saving order
    const newOrder = [...newActiveOrder, ...todos.filter(t => t.completed)];
    reorderTodos(newOrder);
  };

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
    if (!openRouterApiKey) { alert('API key required in Settings.'); return; }
    if (goals.length === 0) { alert('No goals exists yet.'); return; }
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
      alert('Failed to generate tasks.');
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

  const renderTodoContent = (todo: typeof todos[0]) => (
    <>
      <button  
        className="checkbox-custom"
        onClick={() => toggleTodo(todo.id)}
      >
        <motion.div 
          initial={false}
          animate={{ scale: todo.completed ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check size={16} />
        </motion.div>
      </button>
      {editingId === todo.id ? (
        <AutocompleteInput
          autoFocus
          className="input-glass"
          style={{ flex: 1, padding: '0.5rem 1rem' }}
          value={editText}
          onChange={setEditText}
          onBlur={handleEditSubmit}
          onSubmit={handleEditSubmit}
        />
      ) : (
        <span 
          className="todo-text" 
          onDoubleClick={() => handleEditStart(todo.id, todo.text)}
          style={{ cursor: 'text' }}
        >
          <ParsedText text={todo.text} />
        </span>
      )}
      <button className="del-btn" onClick={() => deleteTodo(todo.id)}>
        <Trash2 size={16} />
      </button>
    </>
  );

  return (
    <div className="tab-container todo-v1">
      <form onSubmit={handleAdd} className="add-form glass-panel">
        <div style={{position: 'relative', flex: 1}}>
          <AutocompleteInput
            className="input-glass"
            placeholder="What needs to be done?"
            value={newText}
            onChange={setNewText}
            onSubmit={() => {
              if (newText.trim()) {
                addTodo(newText.trim());
                setNewText('');
              }
            }}
            style={{ paddingRight: goals.length > 0 ? '48px' : '1.25rem' }}
          />
          {goals.length > 0 && (
            <button type="button" onClick={handleWandClick} className="wand-btn-v1" disabled={inferenceMode !== 'hidden'} title="Auto-suggest tasks from goals">
              <Wand2 size={18}/>
            </button>
          )}
        </div>
        <button type="submit" className="add-btn btn-primary" disabled={!newText.trim()}>
          <Plus size={20} />
        </button>
      </form>

      {inferenceMode !== 'hidden' && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1rem', borderRadius: '12px', background: 'var(--surface-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-light)', margin: 0 }}>
              {inferenceMode === 'select-goal' && 'Which goal should we focus on?'}
              {inferenceMode === 'loading' && 'Analyzing profile & goal...'}
              {inferenceMode === 'select-tasks' && 'Suggested actions:'}
            </h3>
            <button onClick={() => setInferenceMode('hidden')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {inferenceMode === 'select-goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {goals.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => handleGoalSelect(g.id)}
                  style={{ textAlign: 'left', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <span style={{ fontWeight: 500 }}>{g.text}</span>
                  <span style={{ color: 'var(--accent-light)' }}>{g.progress}%</span>
                </button>
              ))}
            </div>
          )}

          {inferenceMode === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0', color: 'var(--accent-light)' }}>
              <Loader2 size={32} className="spin" />
            </div>
          )}

          {inferenceMode === 'select-tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {suggestedTasks.map((task, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: task.selected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: task.selected ? '1px solid var(--accent)' : '1px solid var(--surface-border)', transition: 'all 0.2s' }}>
                  <input 
                    type="checkbox" 
                    checked={task.selected} 
                    onChange={() => toggleSuggestion(idx)}
                    style={{ marginTop: '0.25rem', width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent)' }} 
                  />
                  <span style={{ color: task.selected ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.4' }}>{task.text}</span>
                </label>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button onClick={handleAddSelected} className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }} disabled={!suggestedTasks.some(t => t.selected)}>
                  Add Selected Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="todos-wrapper">
        <Reorder.Group axis="y" values={activeTodos} onReorder={handleReorder} className="todo-list">
          <AnimatePresence>
            {activeTodos.length === 0 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="empty-state">
                No active tasks.
              </motion.div>
            )}
            {activeTodos.map((todo) => (
              <Reorder.Item
                key={todo.id}
                value={todo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`todo-item glass-panel`}
              >
                {renderTodoContent(todo)}
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {completedTodos.length > 0 && (
          <div className="completed-group" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '0.5rem', marginBottom: '0.25rem' }}>Completed</h4>
            <AnimatePresence>
              {completedTodos.map(todo => (
                <motion.div 
                  key={todo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`todo-item glass-panel completed`}
                >
                  {renderTodoContent(todo)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {archivedTodos.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className="btn-primary" 
              style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--surface-border)', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {showArchived ? 'Hide Archived' : `Show Archived (${archivedTodos.length})`}
            </button>
            
            <AnimatePresence>
              {showArchived && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', overflow: 'hidden' }}
                >
                  {archivedTodos.map(todo => (
                    <motion.div 
                      key={todo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={`todo-item glass-panel completed`}
                    >
                      {renderTodoContent(todo)}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
