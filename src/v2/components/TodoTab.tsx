import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { X, ArrowUpRight, Loader2, Wand2, CheckSquare } from 'lucide-react';
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
    if (!openRouterApiKey) { alert('API key required.'); return; }
    if (goals.length === 0) { alert('No objectives found.'); return; }
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
      alert('Failed to generate steps.');
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

  const pendingCount = activeTodos.length;

  const renderTodoContent = (todo: typeof todos[0]) => (
    <div className="todo-content">
      <button 
        className="minimal-checkbox"
        onClick={() => toggleTodo(todo.id)}
        aria-label="Toggle Complete"
      >
        <motion.div 
          className="checkbox-fill"
          initial={false}
          animate={{ scale: todo.completed ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      
      {editingId === todo.id ? (
        <AutocompleteInput
          autoFocus
          className="input-underline font-serif"
          style={{ flex: 1, padding: 0 }}
          value={editText}
          onChange={setEditText}
          onBlur={handleEditSubmit}
          onSubmit={handleEditSubmit}
        />
      ) : (
        <span 
          className="todo-text font-sans" 
          onDoubleClick={() => handleEditStart(todo.id, todo.text)}
          style={{ cursor: 'text' }}
        >
          <ParsedText text={todo.text} />
        </span>
      )}
      
      <button className="icon-btn delete-btn" onClick={() => deleteTodo(todo.id)}>
        <X size={16} />
      </button>
    </div>
  );

  return (
    <div className="tab-container todo-minimal">
      <div className="tab-header">
        <h2 className="font-serif tab-title">Itinerary</h2>
        <span className="count-badge font-sans">{pendingCount}</span>
      </div>

      <form onSubmit={handleAdd} className="add-form-minimal">
        <div className="input-wrap">
          <AutocompleteInput
            className="input-underline font-serif"
            placeholder="Add an objective..."
            value={newText}
            onChange={setNewText}
            onSubmit={() => {
              if (newText.trim()) {
                addTodo(newText.trim());
                setNewText('');
              }
            }}
            style={{ paddingRight: goals.length > 0 ? '70px' : '36px' }}
          />
          {goals.length > 0 && (
            <button type="button" onClick={handleWandClick} className="wand-btn-editorial" disabled={inferenceMode !== 'hidden'} title="Suggest steps">
              <Wand2 size={16}/>
            </button>
          )}
          <button type="submit" className="circle-btn submit-btn" disabled={!newText.trim()}>
            <ArrowUpRight size={18} />
          </button>
        </div>
      </form>

      {inferenceMode !== 'hidden' && (
        <div style={{ border: '2px solid var(--text-primary)', borderTop: 'none', padding: '1.5rem', background: 'var(--surface-bg)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--text-primary)', paddingBottom: '0.75rem', marginBottom: '1.25rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: 0, textTransform: 'uppercase' }}>
              {inferenceMode === 'select-goal' && 'Select Objective'}
              {inferenceMode === 'loading' && 'Consulting AI...'}
              {inferenceMode === 'select-tasks' && 'Proposed Steps'}
            </h3>
            <button onClick={() => setInferenceMode('hidden')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={20} />
            </button>
          </div>

          {inferenceMode === 'select-goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {goals.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => handleGoalSelect(g.id)}
                  className="font-sans"
                  style={{ textAlign: 'left', padding: '1rem', background: 'transparent', border: '1px solid var(--surface-border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg-color)' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'inherit' }}
                >
                  <span style={{ fontWeight: 600 }}>{g.text}</span>
                  <span>{g.progress}%</span>
                </button>
              ))}
            </div>
          )}

          {inferenceMode === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
              <Loader2 size={32} className="spin" />
            </div>
          )}

          {inferenceMode === 'select-tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {suggestedTasks.map((task, idx) => (
                <label key={idx} className="font-sans" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', padding: '0.75rem', border: task.selected ? '2px solid var(--text-primary)' : '1px solid var(--surface-border)' }}>
                  <input 
                    type="checkbox" 
                    checked={task.selected} 
                    onChange={() => toggleSuggestion(idx)}
                    style={{ marginTop: '0.2rem', width: '1.2rem', height: '1.2rem', accentColor: 'var(--text-primary)' }} 
                  />
                  <span style={{ fontSize: '1.1rem', fontWeight: task.selected ? 600 : 400 }}>{task.text}</span>
                </label>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={handleAddSelected} className="btn-brutal font-sans" disabled={!suggestedTasks.some(t => t.selected)}>
                  <span className="btn-content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckSquare size={16} /> ADD ALL SELECTED
                  </span>
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="empty-state-elegant font-serif"
              >
                <p>The canvas is clear.</p>
              </motion.div>
            )}
            
            {activeTodos.map((todo) => (
              <Reorder.Item
                key={todo.id}
                value={todo}
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className={`todo-row`}
              >
                {renderTodoContent(todo)}
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {completedTodos.length > 0 && (
          <div className="completed-group" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <h4 className="font-sans" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 0.5rem 0' }}>Archived</h4>
            <AnimatePresence>
              {completedTodos.map(todo => (
                <motion.div 
                  key={todo.id}
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  className={`todo-row is-done`}
                >
                  {renderTodoContent(todo)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {archivedTodos.length > 0 && (
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className="font-sans" 
              style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--surface-border)', fontSize: '0.75rem', padding: '0.5rem 1rem', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
            >
              {showArchived ? 'Hide History' : `Show History (${archivedTodos.length})`}
            </button>
            
            <AnimatePresence>
              {showArchived && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem', overflow: 'hidden' }}
                >
                  {archivedTodos.map(todo => (
                    <motion.div 
                      key={todo.id}
                      initial={{ opacity: 0, height: 0, scale: 0.98 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      className={`todo-row is-done`}
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
