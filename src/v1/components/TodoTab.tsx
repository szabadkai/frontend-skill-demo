import React, { useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Check, GripVertical } from 'lucide-react';
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

  return (
    <div className="tab-container todo-v1">
      <form onSubmit={handleAdd} className="add-form glass-panel">
        <input
          type="text"
          className="input-glass"
          placeholder="What needs to be done?"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button type="submit" className="add-btn btn-primary" disabled={!newText.trim()}>
          <Plus size={20} />
        </button>
      </form>

      <div className="todos-wrapper">
        <Reorder.Group axis="y" values={todos} onReorder={reorderTodos} className="todo-list">
          <AnimatePresence>
            {todos.length === 0 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="empty-state">
                No active tasks.
              </motion.div>
            )}
            {todos.map((todo) => (
              <Reorder.Item
                key={todo.id}
                value={todo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`todo-item glass-panel ${todo.completed ? 'completed' : ''}`}
              >
                <div className="drag-handle"><GripVertical size={18} /></div>
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
                <span className="todo-text">{todo.text}</span>
                <button className="del-btn" onClick={() => deleteTodo(todo.id)}>
                  <Trash2 size={16} />
                </button>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}
