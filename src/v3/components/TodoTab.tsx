import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Plus, X, Check, GripVertical } from 'lucide-react';
import './TodoTab.css';

export default function TodoTab() {
  const { todos, addTodo, toggleTodo, deleteTodo, reorderTodos, editTodo } = useStore();
  const [newText, setNewText] = useState('');
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
          <input type="text" className="input-bubbly" placeholder="I need to..." value={newText} onChange={(e) => setNewText(e.target.value)} />
          <button type="submit" className="bubbly-add-btn" disabled={!newText.trim()}>
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </form>

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
                    <input
                      autoFocus
                      className="input-bubbly"
                      style={{ flex: 1, padding: '0.25rem 1rem' }}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={handleEditSubmit}
                      onKeyDown={handleEditKey}
                    />
                  ) : (
                    <span 
                      className="todo-text-soft" 
                      onDoubleClick={() => handleEditStart(todo.id, todo.text)}
                      style={{ cursor: 'text' }}
                    >
                      {todo.text}
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
