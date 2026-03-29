import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CornerDownLeft, X, Check, GripVertical, Loader2, Cpu } from 'lucide-react';
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
    if (!openRouterApiKey) { alert('[ERROR] API KEY REQUIRED IN SYSTEM.'); return; }
    if (goals.length === 0) { alert('[ERROR] NO TARGET OBJECTIVES.'); return; }
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
      alert('[ERROR] INFERENCE FAILED.');
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

  const renderTodoContent = (todo: typeof todos[0], idx: number, isDraggable: boolean = true) => (
    <div className={`todo-content-tech`}>
      {isDraggable ? (
        <div className="drag-handle-tech">
          <GripVertical size={14} className="grip-icon-tech" />
        </div>
      ) : (
        <div className="drag-handle-tech" style={{ opacity: 0.2 }}>
           <Check size={14} className="grip-icon-tech" />
        </div>
      )}
      
      <span className="task-idx mono-text text-muted">
        {String(idx).padStart(2, '0')}
      </span>
      
      <button 
        className={`checkbox-tech ${todo.completed ? 'checked-tech' : ''}`}
        onClick={() => toggleTodo(todo.id)}
        aria-label="Toggle Complete"
      >
        <AnimatePresence>
          {todo.completed && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
            >
              <Check size={12} strokeWidth={4} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      
      {editingId === todo.id ? (
        <AutocompleteInput
          autoFocus
          className="input-tech"
          style={{ flex: 1, padding: '0.25rem 0.5rem' }}
          value={editText}
          onChange={setEditText}
          onBlur={handleEditSubmit}
          onSubmit={handleEditSubmit}
        />
      ) : (
        <span 
          className={`todo-text-tech ${todo.completed ? 'mono-text' : ''}`} 
          onDoubleClick={() => handleEditStart(todo.id, todo.text)}
          style={{ cursor: 'text' }}
        >
          <ParsedText text={todo.text} />
        </span>
      )}
      
      <button className="delete-btn-tech" onClick={() => deleteTodo(todo.id)}>
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );

  return (
    <div className="tab-container todo-tech">
      <div className="tab-header-tech">
        <h2 className="tab-title-tech mono-text">/tasks</h2>
        <div className="status-badge-tech mono-text">
          {pendingCount} PENDING
        </div>
      </div>

      <form onSubmit={handleAdd} className="add-form-tech">
        <div className="input-wrap-tech">
          <span className="prompt-symbol mono-text">&gt;</span>
          <AutocompleteInput
            className="input-tech prompt-input"
            placeholder="enter_task_string..."
            value={newText}
            onChange={setNewText}
            onSubmit={() => {
              if (newText.trim()) {
                addTodo(newText.trim());
                setNewText('');
              }
            }}
          />
          {goals.length > 0 && (
            <button type="button" onClick={handleWandClick} className="wand-btn-tech" disabled={inferenceMode !== 'hidden'} title="[ INFER_TASKS ]">
              <Cpu size={16}/>
            </button>
          )}
          <button type="submit" className="submit-btn-tech" disabled={!newText.trim()}>
            <CornerDownLeft size={16} />
          </button>
        </div>
      </form>

      {inferenceMode !== 'hidden' && (
        <div className="chrome-panel inference-widget" style={{ padding: '1rem', marginTop: '1rem', border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="mono-text" style={{ color: 'var(--accent)' }}>
              {inferenceMode === 'select-goal' && '> SELECT_TARGET_OBJECTIVE'}
              {inferenceMode === 'loading' && '> EVALUATING_HEURISTICS...'}
              {inferenceMode === 'select-tasks' && '> REVIEW_GENERATED_TASKS'}
            </span>
            <button onClick={() => setInferenceMode('hidden')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          {inferenceMode === 'select-goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {goals.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => handleGoalSelect(g.id)}
                  className="mono-text"
                  style={{ textAlign: 'left', padding: '0.75rem', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>{g.text}</span>
                  <span style={{ color: 'var(--text-muted)' }}>[{g.progress}%]</span>
                </button>
              ))}
            </div>
          )}

          {inferenceMode === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', color: 'var(--accent)' }}>
              <Loader2 size={24} className="spin" />
            </div>
          )}

          {inferenceMode === 'select-tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {suggestedTasks.map((task, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', background: task.selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent', borderRadius: '4px' }}>
                  <input 
                    type="checkbox" 
                    checked={task.selected} 
                    onChange={() => toggleSuggestion(idx)}
                    style={{ marginTop: '0.25rem' }} 
                  />
                  <span className="mono-text" style={{ color: task.selected ? 'var(--text-primary)' : 'var(--text-muted)' }}>{task.text}</span>
                </label>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={handleAddSelected} className="submit-btn-tech mono-text" style={{ border: '1px solid var(--accent)', padding: '0.5rem 1rem' }} disabled={!suggestedTasks.some(t => t.selected)}>
                  [ COMMIT_SELECTED ]
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="todos-wrapper-tech">
        <div className="list-header-tech mono-text">
          <span>ID</span>
          <span>PAYLOAD</span>
          <span className="right-align">ACTIONS</span>
        </div>
        
        <Reorder.Group axis="y" values={activeTodos} onReorder={handleReorder} className="todo-list-tech">
          <AnimatePresence mode="popLayout">
            {activeTodos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-state-tech mono-text"
              >
                [ NULL ] - NO ALLOCATED TASKS
              </motion.div>
            )}
            
            {activeTodos.map((todo, idx) => (
              <Reorder.Item
                key={todo.id}
                value={todo}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 40 }}
                className={`todo-row-tech chrome-panel`}
              >
                {renderTodoContent(todo, idx, true)}
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {completedTodos.length > 0 && (
          <div className="completed-group" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h4 className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent)', paddingLeft: '0.75rem', marginBottom: '0.25rem' }}>&gt; EXECUTED_PAYLOADS</h4>
            <AnimatePresence mode="popLayout">
              {completedTodos.map((todo, idx) => (
                <motion.div 
                  key={todo.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 40 }}
                  className={`todo-row-tech chrome-panel is-done-tech`}
                >
                  {renderTodoContent(todo, activeTodos.length + idx, false)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {archivedTodos.length > 0 && (
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className="submit-btn-tech mono-text"
              style={{ padding: '0.5rem 1.5rem', border: '1px solid var(--surface-border)' }}
            >
              {showArchived ? '[ HIDE_ARCHIVE ]' : `[ EXPAND_ARCHIVE: ${archivedTodos.length} ]`}
            </button>
            <AnimatePresence mode="popLayout">
              {showArchived && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', marginTop: '1.5rem', overflow: 'hidden', gap: '0.4rem' }}
                >
                  {archivedTodos.map((todo, idx) => (
                    <motion.div 
                      key={todo.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 40 }}
                      className={`todo-row-tech chrome-panel is-done-tech opacity-muted`}
                    >
                      {renderTodoContent(todo, activeTodos.length + completedTodos.length + idx, false)}
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
