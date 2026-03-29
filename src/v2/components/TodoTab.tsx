import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { X, ArrowUpRight, ArrowRight, Loader2 } from 'lucide-react';
import { inferTodos } from '../../services/llm';
import './TodoTab.css';

export default function TodoTab() {
  const { todos, goals, openRouterApiKey, addTodo, toggleTodo, deleteTodo, reorderTodos, editTodo } = useStore();
  const [newText, setNewText] = useState('');
  const [isInferring, setIsInferring] = useState(false);
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
  
  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') setEditingId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      addTodo(newText.trim());
      setNewText('');
    }
  };

  const handleInfer = async () => {
    if (!openRouterApiKey) { alert('API key required in System.'); return; }
    setIsInferring(true);
    try {
        const newTodos = await inferTodos(openRouterApiKey, todos, goals);
        newTodos.forEach(nt => addTodo(nt.text));
    } catch {
        alert('Failed to infer items.');
    } finally {
        setIsInferring(false);
    }
  };

  const pendingCount = todos.filter(t => !t.completed).length;

  return (
    <div className="tab-container todo-minimal">
      <div className="tab-header">
        <h2 className="font-serif tab-title">Itinerary</h2>
        <span className="count-badge font-sans">{pendingCount}</span>
      </div>

      <form onSubmit={handleAdd} className="add-form-minimal">
        <div className="input-wrap">
          <input
            type="text"
            className="input-underline font-serif"
            placeholder="Add an objective..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button type="submit" className="circle-btn submit-btn" disabled={!newText.trim()}>
            <ArrowUpRight size={18} />
          </button>
        </div>
      </form>

      {goals.length > 0 && (
        <button className="btn-brutal font-sans" style={{width: '100%', padding: '1rem', marginTop: '-0.5rem'}} onClick={handleInfer} disabled={isInferring}>
          {isInferring ? (
            <span className="btn-content"><Loader2 className="spin" size={16} /> ANALYZING</span>
          ) : (
            <span className="btn-content">INFER OBJECTIVES <ArrowRight size={16} /></span>
          )}
        </button>
      )}

      <div className="todos-wrapper">
        <Reorder.Group axis="y" values={todos} onReorder={reorderTodos} className="todo-list">
          <AnimatePresence>
            {todos.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="empty-state-elegant font-serif"
              >
                <p>The canvas is clear.</p>
              </motion.div>
            )}
            
            {todos.map((todo) => (
              <Reorder.Item
                key={todo.id}
                value={todo}
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className={`todo-row ${todo.completed ? 'is-done' : ''}`}
              >
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
                    <input
                      autoFocus
                      className="input-underline font-serif"
                      style={{ flex: 1, padding: 0 }}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={handleEditSubmit}
                      onKeyDown={handleEditKey}
                    />
                  ) : (
                    <span 
                      className="todo-text font-sans" 
                      onDoubleClick={() => handleEditStart(todo.id, todo.text)}
                      style={{ cursor: 'text' }}
                    >
                      {todo.text}
                    </span>
                  )}
                  
                  <button className="icon-btn delete-btn" onClick={() => deleteTodo(todo.id)}>
                    <X size={16} />
                  </button>
                  
                  <div className="drag-handle">
                    <div className="grip-lines"></div>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}
