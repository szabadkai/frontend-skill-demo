import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Goal {
  id: string;
  text: string;
  progress: number; // 0 to 100
  inferred: boolean;
}

interface AppState {
  todos: Todo[];
  goals: Goal[];
  openRouterApiKey: string;
  
  // Actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
  
  addGoal: (text: string, inferred?: boolean) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  deleteGoal: (id: string) => void;
  setGoals: (goals: Goal[]) => void; // Used for LLM replacing goals
  
  setApiKey: (key: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      todos: [],
      goals: [],
      openRouterApiKey: '',
      
      addTodo: (text) => set((state) => ({
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() }
        ]
      })),
      
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      })),
      
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id)
      })),
      
      reorderTodos: (todos) => set({ todos }),
      
      addGoal: (text, inferred = false) => set((state) => ({
        goals: [
          ...state.goals,
          { id: crypto.randomUUID(), text, progress: 0, inferred }
        ]
      })),
      
      updateGoalProgress: (id, progress) => set((state) => ({
        goals: state.goals.map(goal =>
          goal.id === id ? { ...goal, progress } : goal
        )
      })),
      
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(goal => goal.id !== id)
      })),
      
      setGoals: (goals) => set({ goals }),
      
      setApiKey: (key) => set({ openRouterApiKey: key }),
    }),
    {
      name: 'todo-ai-storage',
    }
  )
);
