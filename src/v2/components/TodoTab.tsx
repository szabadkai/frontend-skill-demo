import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { X, ArrowUpRight } from 'lucide-react';
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
                  
                  <span className="todo-text font-sans">{todo.text}</span>
                  
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
