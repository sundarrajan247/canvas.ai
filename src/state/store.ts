import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import {
  addGoal as repoAddGoal,
  addMemory as repoAddMemory,
  addTodo as repoAddTodo,
  createCanvas as repoCreateCanvas,
  deleteCanvas as repoDeleteCanvas,
  ensureProfile,
  listCanvases,
  listGoals,
  listMemories,
  listTodos,
  removeGoal as repoRemoveGoal,
  removeMemory as repoRemoveMemory,
  removeTodo as repoRemoveTodo,
  toggleTodo as repoToggleTodo,
  updateCanvas as repoUpdateCanvas
} from '../data/canvasRepo';
import type {
  AppTab,
  CanvasRecord,
  ChatMessage,
  GoalRecord,
  Memory,
  MobileNav,
  Profile,
  TodoRecord
} from '../types';

type ThemeMode = 'light' | 'dark';

interface AppStore {
  isAuthReady: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  authError: string;

  theme: ThemeMode;
  mobileNav: MobileNav;
  activeCanvasId: string | 'global';
  activeCanvasTab: AppTab;
  isCanvasSwitcherOpen: boolean;
  isChatOpen: boolean;
  chatInput: string;
  toast: string;

  canvases: CanvasRecord[];
  goalsByCanvas: Record<string, GoalRecord[]>;
  todosByCanvas: Record<string, TodoRecord[]>;
  memoriesByCanvas: Record<string, Memory[]>;
  chatByCanvas: Record<string, ChatMessage[]>;

  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setMobileNav: (nav: MobileNav) => void;
  setActiveCanvasId: (id: string | 'global') => Promise<void>;
  setActiveCanvasTab: (tab: AppTab) => void;
  setCanvasSwitcherOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setChatInput: (text: string) => void;
  setToast: (text: string) => void;

  setHandle: (handle: string) => Promise<void>;
  loadUserData: () => Promise<void>;
  loadCanvasContent: (canvasId: string) => Promise<void>;

  createCanvas: (name: string) => Promise<void>;
  updateCanvas: (canvasId: string, patch: Partial<CanvasRecord>) => Promise<void>;
  deleteCanvas: (canvasId: string) => Promise<void>;

  addGoal: (canvasId: string, title: string) => Promise<void>;
  removeGoal: (canvasId: string, goalId: string) => Promise<void>;

  addTodo: (canvasId: string, text: string) => Promise<void>;
  toggleTodo: (canvasId: string, todoId: string) => Promise<void>;
  removeTodo: (canvasId: string, todoId: string) => Promise<void>;

  addMemory: (canvasId: string, type: Memory['type'], text: string, sourceMessageId?: string) => Promise<void>;
  removeMemory: (canvasId: string, memoryId: string) => Promise<void>;

  sendChatMessage: (canvasId: string, prompt: string, mode: AppTab) => Promise<void>;
}

const THEME_KEY = 'canvas-theme';
const nowIso = () => new Date().toISOString();
const fmt = (iso: string) => new Date(iso).toLocaleString();
const initialsFor = (name: string) =>
  name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'CV';

const modeLabel = (tab: AppTab) => {
  if (tab === 'canvas') return 'Canvas settings';
  if (tab === 'goals') return 'Goals planning';
  if (tab === 'todo') return 'Execution mode';
  if (tab === 'inbox') return 'Inbox triage';
  return 'Focus mode';
};

const DEMO_CANVASES = [
  {
    name: 'Vikram Development',
    subtitle: 'Academic outcomes and family execution system',
    avatar_initials: 'VD',
    status_label: 'At Risk' as const,
    goals: ['Raise English writing consistency', 'Protect confidence under exam pressure'],
    todos: ['Schedule two prep blocks before Friday', 'Draft teacher follow-up update'],
    memories: [
      { type: 'principle' as const, text: 'Protect deep work before test day.' },
      { type: 'constraint' as const, text: 'No tasks after 9 PM for family schedule.' }
    ]
  },
  {
    name: 'California Relocation',
    subtitle: 'Move planning, school shortlist, logistics runway',
    avatar_initials: 'CR',
    status_label: 'On Track' as const,
    goals: ['Lock neighborhood shortlist', 'Finalize moving timeline'],
    todos: ['Collect school admission dates'],
    memories: [{ type: 'decision' as const, text: 'Prioritize commute and school quality over square footage.' }]
  },
  {
    name: 'Career Growth 2026',
    subtitle: 'Leadership trajectory and portfolio execution',
    avatar_initials: 'CG',
    status_label: 'Behind' as const,
    goals: ['Ship high-quality public portfolio projects'],
    todos: ['Reserve weekend deep work block'],
    memories: [{ type: 'principle' as const, text: 'Consistency beats intensity for long-term compounding.' }]
  }
];

let authInitialized = false;

export const useAppStore = create<AppStore>((set, get) => ({
  isAuthReady: false,
  isLoading: false,
  isAuthenticated: false,
  session: null,
  user: null,
  profile: null,
  authError: '',

  theme: (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark',
  mobileNav: 'focus',
  activeCanvasId: 'global',
  activeCanvasTab: 'focus',
  isCanvasSwitcherOpen: false,
  isChatOpen: false,
  chatInput: '',
  toast: '',

  canvases: [],
  goalsByCanvas: {},
  todosByCanvas: {},
  memoriesByCanvas: {},
  chatByCanvas: {},

  initializeAuth: async () => {
    if (authInitialized) return;
    authInitialized = true;

    set({ isLoading: true });
    const {
      data: { session }
    } = await supabase.auth.getSession();

    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isAuthReady: true,
      isLoading: false
    });

    if (session?.user) {
      const profile = await ensureProfile(session.user.id, session.user.email ?? undefined);
      set({ profile });
      await get().loadUserData();
    }

    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      set({
        session: nextSession,
        user: nextSession?.user ?? null,
        isAuthenticated: !!nextSession?.user,
        authError: ''
      });

      if (nextSession?.user) {
        const profile = await ensureProfile(nextSession.user.id, nextSession.user.email ?? undefined);
        set({ profile });
        await get().loadUserData();
      } else {
        set({
          profile: null,
          canvases: [],
          goalsByCanvas: {},
          todosByCanvas: {},
          memoriesByCanvas: {},
          chatByCanvas: {},
          activeCanvasId: 'global',
          activeCanvasTab: 'focus',
          mobileNav: 'focus',
          isCanvasSwitcherOpen: false,
          isChatOpen: false,
          chatInput: ''
        });
      }
    });
  },

  signIn: async (email, password) => {
    set({ authError: '', isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ isLoading: false });
    if (error) {
      set({ authError: error.message });
      return false;
    }
    return true;
  },

  signUp: async (email, password) => {
    set({ authError: '', isLoading: true });
    const { error } = await supabase.auth.signUp({ email, password });
    set({ isLoading: false });
    if (error) {
      set({ authError: error.message });
      return false;
    }
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    set({ theme: next });
  },

  setMobileNav: (mobileNav) => set({ mobileNav }),
  setActiveCanvasId: async (activeCanvasId) => {
    set({ activeCanvasId, activeCanvasTab: 'focus', isCanvasSwitcherOpen: false });
    if (activeCanvasId !== 'global') {
      await get().loadCanvasContent(activeCanvasId);
    }
  },
  setActiveCanvasTab: (activeCanvasTab) => set({ activeCanvasTab }),
  setCanvasSwitcherOpen: (isCanvasSwitcherOpen) => set({ isCanvasSwitcherOpen }),
  setChatOpen: (isChatOpen) => set({ isChatOpen }),
  setChatInput: (chatInput) => set({ chatInput }),
  setToast: (toast) => set({ toast }),

  setHandle: async (handle) => {
    const user = get().user;
    if (!user || !handle.trim()) return;

    const { data, error } = await supabase
      .from('profiles')
      .update({ handle: handle.trim() })
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      set({ authError: error.message });
      return;
    }

    set({ profile: data as Profile, authError: '' });
  },

  loadUserData: async () => {
    const user = get().user;
    if (!user) return;

    const canvases = await listCanvases(user.id);

    if (canvases.length === 0) {
      const createdCanvases: CanvasRecord[] = [];
      for (const entry of DEMO_CANVASES) {
        const canvas = await repoCreateCanvas(user.id, {
          name: entry.name,
          subtitle: entry.subtitle,
          avatar_initials: entry.avatar_initials,
          status_label: entry.status_label,
          members: [{ id: crypto.randomUUID(), email: user.email ?? 'supriya0506@example.com', role: 'editor', name: 'supriya0506' }]
        });

        createdCanvases.push(canvas);
        for (const goal of entry.goals) {
          await repoAddGoal(canvas.id, goal);
        }
        for (const todo of entry.todos) {
          await repoAddTodo(canvas.id, todo);
        }
        for (const memory of entry.memories) {
          await repoAddMemory(canvas.id, memory.type, memory.text);
        }
      }

      set({ canvases: createdCanvases, activeCanvasId: createdCanvases[0]?.id ?? 'global' });
      if (createdCanvases[0]) {
        await get().loadCanvasContent(createdCanvases[0].id);
      }
      return;
    }

    set({ canvases });
    const nextActive = get().activeCanvasId === 'global' ? canvases[0]?.id : get().activeCanvasId;
    if (nextActive && nextActive !== 'global') {
      set({ activeCanvasId: nextActive });
      await get().loadCanvasContent(nextActive);
    }
  },

  loadCanvasContent: async (canvasId) => {
    const [goals, todos, memories] = await Promise.all([listGoals(canvasId), listTodos(canvasId), listMemories(canvasId)]);
    set((state) => ({
      goalsByCanvas: { ...state.goalsByCanvas, [canvasId]: goals },
      todosByCanvas: { ...state.todosByCanvas, [canvasId]: todos },
      memoriesByCanvas: { ...state.memoriesByCanvas, [canvasId]: memories },
      chatByCanvas: state.chatByCanvas[canvasId]
        ? state.chatByCanvas
        : {
            ...state.chatByCanvas,
            [canvasId]: [
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: 'Agent online. I can help prioritize this canvas.',
                timestamp: fmt(nowIso())
              }
            ]
          }
    }));
  },

  createCanvas: async (name) => {
    const user = get().user;
    if (!user || !name.trim()) return;

    const created = await repoCreateCanvas(user.id, {
      name: name.trim(),
      subtitle: 'New canvas. Define goals and execution plan.',
      avatar_initials: initialsFor(name),
      status_label: 'At Risk',
      members: [{ id: crypto.randomUUID(), email: user.email ?? 'supriya0506@example.com', role: 'editor', name: get().profile?.handle ?? 'supriya0506' }]
    });

    set((state) => ({
      canvases: [created, ...state.canvases],
      activeCanvasId: created.id,
      activeCanvasTab: 'focus'
    }));

    await get().loadCanvasContent(created.id);
  },

  updateCanvas: async (canvasId, patch) => {
    const current = get().canvases;
    set({ canvases: current.map((c) => (c.id === canvasId ? { ...c, ...patch } : c)) });

    try {
      const updated = await repoUpdateCanvas(canvasId, patch);
      set((state) => ({ canvases: state.canvases.map((c) => (c.id === canvasId ? updated : c)) }));
    } catch {
      set({ canvases: current });
    }
  },

  deleteCanvas: async (canvasId) => {
    const prev = get().canvases;
    const next = prev.filter((c) => c.id !== canvasId);
    set({ canvases: next, activeCanvasId: next[0]?.id ?? 'global' });

    try {
      await repoDeleteCanvas(canvasId);
    } catch {
      set({ canvases: prev });
    }
  },

  addGoal: async (canvasId, title) => {
    const optimistic: GoalRecord = {
      id: `tmp-${crypto.randomUUID()}`,
      canvas_id: canvasId,
      title,
      summary: 'Goal added from UI',
      horizon: 'this_quarter',
      created_at: nowIso()
    };

    set((state) => ({
      goalsByCanvas: {
        ...state.goalsByCanvas,
        [canvasId]: [optimistic, ...(state.goalsByCanvas[canvasId] ?? [])]
      }
    }));

    try {
      const saved = await repoAddGoal(canvasId, title);
      set((state) => ({
        goalsByCanvas: {
          ...state.goalsByCanvas,
          [canvasId]: (state.goalsByCanvas[canvasId] ?? []).map((goal) => (goal.id === optimistic.id ? saved : goal))
        }
      }));
    } catch {
      set((state) => ({
        goalsByCanvas: {
          ...state.goalsByCanvas,
          [canvasId]: (state.goalsByCanvas[canvasId] ?? []).filter((goal) => goal.id !== optimistic.id)
        }
      }));
    }
  },

  removeGoal: async (canvasId, goalId) => {
    const prev = get().goalsByCanvas[canvasId] ?? [];
    set((state) => ({
      goalsByCanvas: {
        ...state.goalsByCanvas,
        [canvasId]: prev.filter((goal) => goal.id !== goalId)
      }
    }));

    try {
      await repoRemoveGoal(goalId);
    } catch {
      set((state) => ({ goalsByCanvas: { ...state.goalsByCanvas, [canvasId]: prev } }));
    }
  },

  addTodo: async (canvasId, text) => {
    const optimistic: TodoRecord = {
      id: `tmp-${crypto.randomUUID()}`,
      canvas_id: canvasId,
      text,
      is_done: false,
      created_at: nowIso()
    };

    set((state) => ({
      todosByCanvas: {
        ...state.todosByCanvas,
        [canvasId]: [optimistic, ...(state.todosByCanvas[canvasId] ?? [])]
      }
    }));

    try {
      const saved = await repoAddTodo(canvasId, text);
      set((state) => ({
        todosByCanvas: {
          ...state.todosByCanvas,
          [canvasId]: (state.todosByCanvas[canvasId] ?? []).map((todo) => (todo.id === optimistic.id ? saved : todo))
        }
      }));
    } catch {
      set((state) => ({
        todosByCanvas: {
          ...state.todosByCanvas,
          [canvasId]: (state.todosByCanvas[canvasId] ?? []).filter((todo) => todo.id !== optimistic.id)
        }
      }));
    }
  },

  toggleTodo: async (canvasId, todoId) => {
    const list = get().todosByCanvas[canvasId] ?? [];
    const target = list.find((todo) => todo.id === todoId);
    if (!target) return;

    set((state) => ({
      todosByCanvas: {
        ...state.todosByCanvas,
        [canvasId]: list.map((todo) => (todo.id === todoId ? { ...todo, is_done: !todo.is_done } : todo))
      }
    }));

    try {
      const updated = await repoToggleTodo(todoId, !target.is_done);
      set((state) => ({
        todosByCanvas: {
          ...state.todosByCanvas,
          [canvasId]: (state.todosByCanvas[canvasId] ?? []).map((todo) => (todo.id === todoId ? updated : todo))
        }
      }));
    } catch {
      set((state) => ({ todosByCanvas: { ...state.todosByCanvas, [canvasId]: list } }));
    }
  },

  removeTodo: async (canvasId, todoId) => {
    const prev = get().todosByCanvas[canvasId] ?? [];
    set((state) => ({
      todosByCanvas: {
        ...state.todosByCanvas,
        [canvasId]: prev.filter((todo) => todo.id !== todoId)
      }
    }));

    try {
      await repoRemoveTodo(todoId);
    } catch {
      set((state) => ({ todosByCanvas: { ...state.todosByCanvas, [canvasId]: prev } }));
    }
  },

  addMemory: async (canvasId, type, text, sourceMessageId) => {
    const optimistic: Memory = {
      id: `tmp-${crypto.randomUUID()}`,
      canvas_id: canvasId,
      type,
      text,
      created_at: nowIso(),
      source_message_id: sourceMessageId ?? null
    };

    set((state) => ({
      memoriesByCanvas: {
        ...state.memoriesByCanvas,
        [canvasId]: [optimistic, ...(state.memoriesByCanvas[canvasId] ?? [])]
      }
    }));

    try {
      const saved = await repoAddMemory(canvasId, type, text, sourceMessageId);
      set((state) => ({
        memoriesByCanvas: {
          ...state.memoriesByCanvas,
          [canvasId]: (state.memoriesByCanvas[canvasId] ?? []).map((memory) => (memory.id === optimistic.id ? saved : memory))
        }
      }));
    } catch {
      set((state) => ({
        memoriesByCanvas: {
          ...state.memoriesByCanvas,
          [canvasId]: (state.memoriesByCanvas[canvasId] ?? []).filter((memory) => memory.id !== optimistic.id)
        }
      }));
    }
  },

  removeMemory: async (canvasId, memoryId) => {
    const prev = get().memoriesByCanvas[canvasId] ?? [];
    set((state) => ({
      memoriesByCanvas: {
        ...state.memoriesByCanvas,
        [canvasId]: prev.filter((memory) => memory.id !== memoryId)
      }
    }));

    try {
      await repoRemoveMemory(memoryId);
    } catch {
      set((state) => ({ memoriesByCanvas: { ...state.memoriesByCanvas, [canvasId]: prev } }));
    }
  },

  sendChatMessage: async (canvasId, prompt, mode) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: prompt,
      timestamp: fmt(nowIso())
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: `${modeLabel(mode)}: I mapped your request into one immediate action and one follow-up checkpoint.`,
      timestamp: fmt(nowIso())
    };

    set((state) => ({
      chatByCanvas: {
        ...state.chatByCanvas,
        [canvasId]: [...(state.chatByCanvas[canvasId] ?? []), userMessage, assistantMessage]
      },
      chatInput: ''
    }));
  }
}));
