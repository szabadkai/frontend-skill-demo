import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface Todo {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  tags: string[];
  linked_goals: string[];
  created_at: string;
}

export interface Goal {
  id: string;
  list_id: string;
  text: string;
  description?: string;
  progress: number;
  inferred: boolean;
  created_at: string;
}

export interface List {
  id: string;
  name: string;
  owner_id: string;
}

interface AppState {
  // Auth & Lists
  user: User | null;
  activeList: List | null;
  lists: List[];

  // Data
  todos: Todo[];
  goals: Goal[];

  // Local Settings
  openRouterApiKey: string;
  userProfile: string;
  designTheme: 'v1' | 'v2' | 'v3' | 'v4';
  colorMode: 'system' | 'light' | 'dark';
  
  // Actions - Auth & Lists
  setUser: (user: User | null) => void;
  fetchLists: () => Promise<void>;
  createList: (name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  shareList: (id: string, email: string) => Promise<{success: boolean; error?: string}>;
  setActiveList: (list: List) => void;
  fetchData: () => Promise<void>;

  // Actions - Data
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  editTodo: (id: string, newText: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  reorderTodos: (todos: Todo[]) => void;
  
  addGoal: (text: string, inferred?: boolean) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setGoals: (goals: Goal[]) => void; // Used for LLM batch insert later
  
  // Settings Actions
  setApiKey: (key: string) => void;
  setUserProfile: (profile: string) => void;
  setDesignTheme: (theme: 'v1' | 'v2' | 'v3' | 'v4') => void;
  setColorMode: (mode: 'system' | 'light' | 'dark') => void;
}

const extractTagsAndGoals = (text: string) => {
  const tags = (text.match(/#\w+/g) || []).map(t => t.substring(1));
  const linked_goals = (text.match(/@\w+/g) || []).map(g => g.substring(1));
  return { tags, linked_goals };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      activeList: null,
      lists: [],
      todos: [],
      goals: [],
      openRouterApiKey: '',
      userProfile: '',
      designTheme: 'v1',
      colorMode: 'system',

      setUser: (user) => {
        set({ user });
        if (user) {
          if (user.user_metadata?.userProfile) {
            set({ userProfile: user.user_metadata.userProfile });
          }
          get().fetchLists();
        } else {
          set({ lists: [], activeList: null, todos: [], goals: [] });
        }
      },

      fetchLists: async () => {
        const { data, error } = await supabase.from('lists').select('*').order('created_at');
        if (!error && data) {
          set({ lists: data });
          if (data.length > 0 && !get().activeList) {
            get().setActiveList(data[0]);
          } else if (data.length === 0) {
            // Auto create a default list if none exists
            await get().createList('My Tasks');
          }
        }
      },

      createList: async (name) => {
        const user = get().user;
        if (!user) return;
        const { data, error } = await supabase.from('lists').insert({ name, owner_id: user.id }).select().single();
        if (!error && data) {
          set((state) => ({ lists: [...state.lists, data], activeList: data }));
          get().fetchData();
        }
      },

      deleteList: async (id) => {
        const { lists, activeList } = get();
        // Optimistic update
        const remainingLists = lists.filter(l => l.id !== id);
        set({ lists: remainingLists });
        
        if (activeList?.id === id) {
          const nextActive = remainingLists.length > 0 ? remainingLists[0] : null;
          set({ activeList: nextActive });
          get().fetchData();
        }
        
        await supabase.from('lists').delete().eq('id', id);
      },

      shareList: async (id, email) => {
        const { error } = await supabase.rpc('share_list_with_email', {
          target_list_id: id,
          target_email: email
        });
        
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      },

      setActiveList: (list) => {
        set({ activeList: list });
        get().fetchData();
      },

      fetchData: async () => {
        const activeList = get().activeList;
        if (!activeList) return;
        
        const [todosRes, goalsRes] = await Promise.all([
          supabase.from('todos').select('*').eq('list_id', activeList.id).order('created_at'),
          supabase.from('goals').select('*').eq('list_id', activeList.id).order('created_at')
        ]);
        
        if (!todosRes.error) set({ todos: todosRes.data as Todo[] });
        if (!goalsRes.error) set({ goals: goalsRes.data as Goal[] });
      },
      
      addTodo: async (text) => {
        const { activeList } = get();
        if (!activeList) return;
        const { tags, linked_goals } = extractTagsAndGoals(text);
        
        const newTodo = {
          list_id: activeList.id,
          text,
          completed: false,
          tags,
          linked_goals
        };

        const { data } = await supabase.from('todos').insert(newTodo).select().single();
        if (data) set((state) => ({ todos: [...state.todos, data as Todo] }));
      },
      
      toggleTodo: async (id) => {
        const todo = get().todos.find(t => t.id === id);
        if (!todo) return;
        const newStatus = !todo.completed;
        
        // Optimistic
        set((state) => ({
          todos: state.todos.map(t => t.id === id ? { ...t, completed: newStatus } : t)
        }));
        await supabase.from('todos').update({ completed: newStatus }).eq('id', id);
      },
      
      editTodo: async (id, text) => {
        const { tags, linked_goals } = extractTagsAndGoals(text);
        // Optimistic
        set((state) => ({
          todos: state.todos.map(t => t.id === id ? { ...t, text, tags, linked_goals } : t)
        }));
        await supabase.from('todos').update({ text, tags, linked_goals }).eq('id', id);
      },
      
      deleteTodo: async (id) => {
        // Optimistic
        set((state) => ({
          todos: state.todos.filter(t => t.id !== id)
        }));
        await supabase.from('todos').delete().eq('id', id);
      },

      reorderTodos: (todos) => set({ todos }),
      
      addGoal: async (text, inferred = false) => {
        const { activeList } = get();
        if (!activeList) return;
        
        const newGoal = {
          list_id: activeList.id,
          text,
          inferred,
          progress: 0
        };

        const { data } = await supabase.from('goals').insert(newGoal).select().single();
        if (data) set((state) => ({ goals: [...state.goals, data as Goal] }));
      },
      
      updateGoalProgress: async (id, progress) => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, progress } : g)
        }));
        await supabase.from('goals').update({ progress }).eq('id', id);
      },
      
      updateGoal: async (id, updates) => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
        }));
        await supabase.from('goals').update(updates).eq('id', id);
      },
      
      deleteGoal: async (id) => {
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id)
        }));
        await supabase.from('goals').delete().eq('id', id);
      },
      
      // Used by LLM inference (will need to actually bulk insert in real app, doing this simply for now)
      setGoals: (goals) => set({ goals }),
      
      setApiKey: (key) => set({ openRouterApiKey: key }),
      setUserProfile: async (profile) => {
        set({ userProfile: profile });
        const user = get().user;
        if (user) {
          await supabase.auth.updateUser({ data: { userProfile: profile } });
        }
      },
      setDesignTheme: (theme) => set({ designTheme: theme }),
      setColorMode: (mode) => set({ colorMode: mode }),
    }),
    {
      name: 'todo-ai-storage',
      // Only persist local settings, NOT remote data (todos, goals, user configs)
      partialize: (state) => ({
        openRouterApiKey: state.openRouterApiKey,
        userProfile: state.userProfile,
        designTheme: state.designTheme,
        colorMode: state.colorMode,
      }),
    }
  )
);
