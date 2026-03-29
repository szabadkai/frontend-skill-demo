import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { CornerDownLeft, X, Check, GripVertical } from 'lucide-react';
import './TodoTab.css';

export default function TodoTab() {
  const { todos, addTodo, toggleTodo, deleteTodo, reorderTodos } = useStore();
  const [newText, setNewText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      addTodo(newText.trim());
      setNewText('');
    }
  };

  const pendingCount = todos.filter(t => !t.completed).length;

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
          <input
            type="text"
            className="input-tech prompt-input"
            placeholder="enter_task_string..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button type="submit" className="submit-btn-tech" disabled={!newText.trim()}>
            <CornerDownLeft size={16} />
          </button>
        </div>
      </form>

      <div className="todos-wrapper-tech">
        <div className="list-header-tech mono-text">
          <span>ID</span>
          <span>PAYLOAD</span>
          <span className="right-align">ACTIONS</span>
        </div>
        
        <Reorder.Group axis="y" values={todos} onReorder={reorderTodos} className="todo-list-tech">
          <AnimatePresence mode="popLayout">
            {todos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-state-tech mono-text"
              >
                [ NULL ] - NO ALLOCATED TASKS
              </motion.div>
            )}
            
            {todos.map((todo, idx) => (
              <Reorder.Item
                key={todo.id}
                value={todo}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 40 }}
                className={`todo-row-tech chrome-panel ${todo.completed ? 'is-done-tech' : ''}`}
              >
                <div className="todo-content-tech">
                  <div className="drag-handle-tech">
                    <GripVertical size={14} className="grip-icon-tech" />
                  </div>
                  
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
                  
                  <span className={`todo-text-tech ${todo.completed ? 'mono-text' : ''}`}>
                    {todo.text}
                  </span>
                  
                  <button className="delete-btn-tech" onClick={() => deleteTodo(todo.id)}>
                    <X size={14} strokeWidth={2} />
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
