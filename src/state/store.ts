import { create } from 'zustand';
import { seedCanvases, seedFeedback } from '../data/seed';
import type { AppTab, Canvas, ChatMessage, FeedbackEntry, InboxItem, MemberRole, Memory, MemoryEntry, Recommendation, SourceType, TaskGroup } from '../types';

const AUTH_KEY = 'canvas-demo-auth';
const DATA_KEY = 'canvas-demo-data';
const FEEDBACK_KEY = 'canvas-demo-feedback';
const THEME_KEY = 'canvas-demo-theme';

export type ThemeMode = 'light' | 'dark';
export type CanvasScopeId = string; // canvas id or "global"

interface DemoStore {
  isAuthenticated: boolean;
  theme: ThemeMode;
  canvases: Canvas[];
  feedback: FeedbackEntry[];
  activeCanvasId: CanvasScopeId;
  activeCanvasTab: AppTab;
  isCanvasSwitcherOpen: boolean;
  isChatOpen: boolean;
  inboxFilter: SourceType | 'all';
  feedbackOpen: boolean;
  chatInput: string;
  typing: boolean;
  loginError: string;
  assessing: boolean;
  pendingDismissFor: { recommendationId: string; canvasId: string } | null;
  dismissReason: string;
  todoistConnected: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  toggleTheme: () => void;
  setActiveCanvasId: (canvasId: CanvasScopeId) => void;
  setActiveCanvasTab: (tab: AppTab) => void;
  setCanvasSwitcherOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setInboxFilter: (filter: SourceType | 'all') => void;
  setChatInput: (value: string) => void;
  toggleFeedback: () => void;
  connectTodoist: () => void;
  sendChatMessage: (text: string, imageUrl?: string) => void;
  runAssistant: (prompt: string) => Promise<void>;
  addCanvas: (name: string) => void;
  renameActiveCanvas: (name: string) => void;
  setActiveCanvasInitials: (initials: string) => void;
  addMemberToActiveCanvas: (email: string, role: MemberRole) => void;
  setIntegrationConnection: (key: 'gmail' | 'calendar' | 'school', connected: boolean) => void;
  addGoal: (title: string) => void;
  removeGoal: (goalId: string) => void;
  addTaskGroup: (title: string) => void;
  removeTaskGroup: (taskGroupId: string) => void;
  addSubTask: (taskGroupId: string, text: string) => void;
  removeSubTask: (taskGroupId: string, subTaskId: string) => void;
  toggleSubTask: (taskGroupId: string, subTaskId: string) => void;
  acceptRecommendation: (recommendationId: string, canvasId?: string) => void;
  requestDismissRecommendation: (recommendationId: string, canvasId?: string) => void;
  setDismissReason: (value: string) => void;
  confirmDismissRecommendation: () => void;
  cancelDismissRecommendation: () => void;
  assessNow: () => Promise<void>;
  addInboxItem: () => void;
  removeInboxItem: () => void;
  generateDemoRecommendations: () => void;
  captureMemoryFromLastAssistant: () => void;
  addFeedback: (rating: number, category: FeedbackEntry['category'], notes: string) => void;
  resetDemo: () => void;
}

const cloneSeed = () => JSON.parse(JSON.stringify(seedCanvases)) as Canvas[];

const parseStored = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const isValidCanvas = (value: unknown): value is Canvas => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Canvas>;
  return (
    typeof candidate.id === 'string' &&
    Array.isArray(candidate.goals) &&
    Array.isArray(candidate.taskGroups) &&
    Array.isArray(candidate.inbox) &&
    Array.isArray(candidate.calendar) &&
    Array.isArray(candidate.recommendations) &&
    Array.isArray(candidate.memory) &&
    Array.isArray(candidate.chat) &&
    !!candidate.assessment &&
    typeof candidate.assessment.updatedAt === 'string'
  );
};

const loadInitialCanvases = (): Canvas[] => {
  const parsed = parseStored<unknown>(DATA_KEY, null);
  if (!Array.isArray(parsed)) return cloneSeed();
  if (!parsed.every(isValidCanvas)) return cloneSeed();
  return (parsed as Canvas[]).map((canvas) => ({
    ...canvas,
    avatarInitials:
      canvas.avatarInitials ||
      canvas.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') ||
      'CV',
    integrations: canvas.integrations ?? {
      gmail: false,
      calendar: false,
      school: false
    },
    shareInfo: canvas.shareInfo ?? {
      code: `CV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      link: `https://canvas.demo/invite/${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    },
    members: Array.isArray(canvas.members) ? canvas.members : [],
    memories: Array.isArray(canvas.memories) ? canvas.memories : []
  }));
};

const persistCanvases = (canvases: Canvas[]) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(canvases));
};

const persistFeedback = (feedback: FeedbackEntry[]) => {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
};

const getCanvas = (canvases: Canvas[], canvasId: string) => canvases.find((canvas) => canvas.id === canvasId);

const addMemory = (canvas: Canvas, text: string, type: MemoryEntry['type']): Canvas => ({
  ...canvas,
  memory: [{ id: crypto.randomUUID(), text, type, timestamp: new Date().toLocaleString() }, ...canvas.memory].slice(0, 10)
});

const setStatusFromAssessment = (canvas: Canvas): Canvas => {
  const highRiskPending = canvas.recommendations.filter((rec) => rec.state === 'pending' && rec.risk === 'high').length;
  const totalSubTasks = canvas.taskGroups.flatMap((group) => group.subtasks).length;
  const doneSubTasks = canvas.taskGroups.flatMap((group) => group.subtasks).filter((step) => step.done).length;
  const completionRate = totalSubTasks === 0 ? 0 : doneSubTasks / totalSubTasks;

  let status: Canvas['status'];
  if (highRiskPending >= 2 || completionRate < 0.25) status = 'behind';
  else if (highRiskPending >= 1 || completionRate < 0.55) status = 'at_risk';
  else status = 'on_track';

  const statusLabel = status === 'on_track' ? 'On Track' : status === 'at_risk' ? 'At Risk' : 'Behind';
  return { ...canvas, status, statusLabel };
};

const generateAssessment = (canvas: Canvas): Canvas['assessment'] => {
  const totalSubTasks = canvas.taskGroups.flatMap((group) => group.subtasks).length;
  const doneSubTasks = canvas.taskGroups.flatMap((group) => group.subtasks).filter((step) => step.done).length;
  const completionRate = totalSubTasks === 0 ? 0 : Math.round((doneSubTasks / totalSubTasks) * 100);
  const highRiskPending = canvas.recommendations.filter((rec) => rec.state === 'pending' && rec.risk === 'high');
  const highImportanceSignals = canvas.inbox.filter((item) => item.importance === 'high');

  return {
    updatedAt: new Date().toLocaleString(),
    goingWell: [
      completionRate > 55
        ? `Execution momentum is healthy (${completionRate}% of tracked steps complete).`
        : `Execution foundation exists with ${doneSubTasks} completed steps.`,
      canvas.memory[0] ? `Persistent insight retained: ${canvas.memory[0].text}` : 'Memory baseline is stable.'
    ],
    improve: [
      highRiskPending.length > 0
        ? `${highRiskPending.length} high-risk recommendations are waiting for action.`
        : 'Recommendation queue is under control with no unresolved high-risk items.',
      canvas.taskGroups[0] ? `Prioritize one flagship task group: ${canvas.taskGroups[0].title}.` : 'Add one flagship task group.'
    ],
    watchouts: [
      highImportanceSignals[0] ? `Upcoming signal to watch: ${highImportanceSignals[0].title}` : 'No immediate high-importance signals.',
      canvas.recommendations.some((rec) => rec.state === 'pending' && rec.urgency === 'high')
        ? 'One or more urgent recommendations remain unresolved.'
        : 'Urgent recommendation queue is stable.'
    ]
  };
};

const modePrefix = (tab: AppTab) => {
  if (tab === 'canvas') return 'Canvas mode: manage integrations, state, and operating cadence.';
  if (tab === 'goals') return 'Goal strategy mode: focus on long-term intent and milestones.';
  if (tab === 'todo') return 'Execution mode: produce concrete tasks and next actions.';
  if (tab === 'inbox') return 'Signal triage mode: parse incoming signals and prioritize responses.';
  return 'Focus mode: optimize trajectory and identify highest leverage action.';
};

const buildAssistantResponse = (prompt: string, tab: AppTab, canvas: Canvas): string => {
  const lower = prompt.toLowerCase();
  const pending = canvas.recommendations.filter((rec) => rec.state === 'pending');

  if (lower.includes('focus') || lower.includes('next')) {
    return [
      `${modePrefix(tab)}`,
      `Top focus: ${pending[0]?.title ?? 'No urgent recommendation pending.'}`,
      `Second focus: ${canvas.inbox[0]?.title ?? 'No urgent signal pending.'}`
    ].join('\n');
  }

  if (lower.includes('draft') || lower.includes('message')) {
    return `${modePrefix(tab)}\nDraft ready: "We aligned priorities, protected deep-work time, and will update after the next milestone checkpoint."`;
  }

  return `${modePrefix(tab)}\nAgent completed contextual analysis and refreshed priorities.`;
};

const generatedRecommendationsFor = (canvas: Canvas): Recommendation[] => {
  const presets: Record<string, Array<{ title: string; rationale: string; source: 'gmail' | 'calendar' | 'internal'; actionType: 'email_draft' | 'calendar_event' | 'internal_task' }>> = {
    vikram: [
      {
        title: 'Lock one 90-minute essay block before Friday',
        rationale: 'Current schedule lacks a protected writing rehearsal window before test day.',
        source: 'calendar',
        actionType: 'calendar_event'
      },
      {
        title: 'Send teacher update with preparation milestones',
        rationale: 'Aligning expectations early reduces uncertainty and support gaps.',
        source: 'gmail',
        actionType: 'email_draft'
      },
      {
        title: 'Create daily vocabulary micro-checklist',
        rationale: 'Daily repetition creates stability and reduces last-minute stress.',
        source: 'internal',
        actionType: 'internal_task'
      }
    ],
    relocation: [
      {
        title: 'Draft school decision brief for family review',
        rationale: 'A concise one-pager can accelerate final decision alignment.',
        source: 'internal',
        actionType: 'internal_task'
      },
      {
        title: 'Schedule final campus visit before advisor call',
        rationale: 'Completing one final visit de-risks the lease and school commitment sequence.',
        source: 'calendar',
        actionType: 'calendar_event'
      },
      {
        title: 'Send relocation status note to stakeholders',
        rationale: 'Proactive updates minimize coordination drift across family members.',
        source: 'gmail',
        actionType: 'email_draft'
      }
    ],
    career: [
      {
        title: 'Block a weekend deep-work sprint for case study',
        rationale: 'Delivery risk is high without a protected artifact production window.',
        source: 'calendar',
        actionType: 'calendar_event'
      },
      {
        title: 'Draft mentor message requesting targeted feedback',
        rationale: 'Early critique can prevent rework late in the publishing cycle.',
        source: 'gmail',
        actionType: 'email_draft'
      },
      {
        title: 'Create launch checklist for final publish path',
        rationale: 'A tracked checklist improves execution cadence and confidence.',
        source: 'internal',
        actionType: 'internal_task'
      }
    ]
  };
  const base = presets[canvas.id] ?? presets.career;
  return base.map((item, index) => {
    const recommendation: Recommendation = {
      id: crypto.randomUUID(),
      title: item.title,
      urgency: index === 0 ? 'high' : 'medium',
      risk: index === 0 ? 'high' : 'medium',
      rationale: item.rationale,
      details: item.rationale,
      source: item.source,
      actionType: item.actionType,
      impact: 'Generated demo recommendation.',
      state: 'pending',
      requiresApproval: item.actionType !== 'internal_task'
    };
    return recommendation;
  });
};

export const useDemoStore = create<DemoStore>((set, get) => ({
  isAuthenticated: localStorage.getItem(AUTH_KEY) === 'true',
  theme: (localStorage.getItem(THEME_KEY) as ThemeMode) ?? 'dark',
  canvases: loadInitialCanvases(),
  feedback: parseStored(FEEDBACK_KEY, seedFeedback),
  activeCanvasId: 'global',
  activeCanvasTab: 'focus',
  isCanvasSwitcherOpen: false,
  isChatOpen: false,
  inboxFilter: 'all',
  feedbackOpen: false,
  chatInput: '',
  typing: false,
  loginError: '',
  assessing: false,
  pendingDismissFor: null,
  dismissReason: '',
  todoistConnected: false,

  login: (username, password) => {
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem(AUTH_KEY, 'true');
      set({ isAuthenticated: true, loginError: '' });
      return true;
    }
    set({ loginError: 'Invalid credentials. Try admin / admin.' });
    return false;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ isAuthenticated: false });
  },

  toggleTheme: () =>
    set((state) => {
      const nextTheme: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, nextTheme);
      return { theme: nextTheme };
    }),

  setActiveCanvasId: (canvasId) => set({ activeCanvasId: canvasId, activeCanvasTab: 'focus', isCanvasSwitcherOpen: false }),
  setActiveCanvasTab: (tab) => set({ activeCanvasTab: tab }),
  setCanvasSwitcherOpen: (open) => set({ isCanvasSwitcherOpen: open }),
  setChatOpen: (open) => set({ isChatOpen: open }),
  setInboxFilter: (filter) => set({ inboxFilter: filter }),
  setChatInput: (value) => set({ chatInput: value }),
  toggleFeedback: () => set((state) => ({ feedbackOpen: !state.feedbackOpen })),
  connectTodoist: () => set({ todoistConnected: true }),

  sendChatMessage: (text, imageUrl) => {
    const state = get();
    if (state.activeCanvasId === 'global') return;
    const canvases = state.canvases.map((canvas) => {
      if (canvas.id !== state.activeCanvasId) return canvas;
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        timestamp: new Date().toLocaleTimeString(),
        imageUrl
      };
      return { ...canvas, chat: [...canvas.chat, message] };
    });
    persistCanvases(canvases);
    set({ canvases, chatInput: '' });
  },

  runAssistant: async (prompt) => {
    const state = get();
    if (state.activeCanvasId === 'global') return;
    const canvas = getCanvas(state.canvases, state.activeCanvasId);
    if (!canvas) return;

    set({ typing: true });
    await new Promise((resolve) => setTimeout(resolve, 750));

    const lower = prompt.toLowerCase().trim();
    if (lower.startsWith('add goal ')) {
      const title = prompt.slice(9).trim();
      if (title) get().addGoal(title);
    }
    if (lower.startsWith('add todo ')) {
      const title = prompt.slice(9).trim();
      if (title) get().addTaskGroup(title);
    }
    if (lower.startsWith('remove goal ')) {
      const name = prompt.slice(12).trim().toLowerCase();
      const target = canvas.goals.find((goal) => goal.title.toLowerCase().includes(name));
      if (target) get().removeGoal(target.id);
    }

    const responseText = buildAssistantResponse(prompt, get().activeCanvasTab, getCanvas(get().canvases, get().activeCanvasId) ?? canvas);
    const latest = get();
    const canvases = latest.canvases.map((item) => {
      if (item.id !== latest.activeCanvasId) return item;
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString()
      };
      return addMemory({ ...item, chat: [...item.chat, assistantMessage] }, `Agent output (${latest.activeCanvasTab}): ${responseText.slice(0, 90)}...`, 'insight');
    });

    persistCanvases(canvases);
    set({ canvases, typing: false });
  },

  addCanvas: (name) => {
    if (!name.trim()) return;
    const template = get().canvases[0];
    if (!template) return;
    const newCanvas: Canvas = {
      ...JSON.parse(JSON.stringify(template)),
      id: crypto.randomUUID(),
      name: name.trim(),
      avatarInitials: name
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'NC',
      subtitle: 'New canvas. Define goals and connect signals.',
      status: 'at_risk',
      statusLabel: 'At Risk',
      shareInfo: {
        code: `CV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        link: `https://canvas.demo/invite/${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      },
      members: [],
      integrations: {
        gmail: false,
        calendar: false,
        school: false
      },
      recommendations: [],
      goals: [],
      taskGroups: [],
      inbox: [],
      calendar: [],
      memory: [],
      memories: [],
      chat: [],
      assessment: {
        updatedAt: new Date().toLocaleString(),
        goingWell: ['Canvas created.'],
        improve: ['Add goals and priorities.'],
        watchouts: ['No signals connected yet.']
      }
    };
    const canvases = [newCanvas, ...get().canvases];
    persistCanvases(canvases);
    set({ canvases, activeCanvasId: newCanvas.id, activeCanvasTab: 'focus', isCanvasSwitcherOpen: false });
  },

  renameActiveCanvas: (name) => {
    const next = name.trim();
    if (!next || get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => (canvas.id === get().activeCanvasId ? { ...canvas, name: next } : canvas));
    persistCanvases(canvases);
    set({ canvases });
  },

  setActiveCanvasInitials: (initials) => {
    const normalized = initials.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    if (!normalized || get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => (canvas.id === get().activeCanvasId ? { ...canvas, avatarInitials: normalized } : canvas));
    persistCanvases(canvases);
    set({ canvases });
  },

  addMemberToActiveCanvas: (email, role) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      if (canvas.members.some((member) => member.email.toLowerCase() === normalized)) return canvas;
      return {
        ...canvas,
        members: [
          ...canvas.members,
          {
            id: crypto.randomUUID(),
            email: normalized,
            role,
            name: normalized.split('@')[0]
          }
        ]
      };
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  setIntegrationConnection: (key, connected) => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) =>
      canvas.id === get().activeCanvasId ? { ...canvas, integrations: { ...canvas.integrations, [key]: connected } } : canvas
    );
    persistCanvases(canvases);
    set({ canvases });
  },

  addGoal: (title) => {
    if (!title.trim()) return;
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      return addMemory(
        {
          ...canvas,
          goals: [
            {
              id: crypto.randomUUID(),
              title: title.trim(),
              horizon: 'this_quarter',
              summary: 'Added in planning. Refine scope and success metric in the next review.'
            },
            ...canvas.goals
          ]
        },
        `Goal added: ${title.trim()}`,
        'decision'
      );
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  removeGoal: (goalId) => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      const goal = canvas.goals.find((item) => item.id === goalId);
      if (!goal) return canvas;
      return addMemory({ ...canvas, goals: canvas.goals.filter((item) => item.id !== goalId) }, `Goal removed: ${goal.title}`, 'decision');
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  addTaskGroup: (title) => {
    if (!title.trim()) return;
    if (get().activeCanvasId === 'global') return;
    const group: TaskGroup = {
      id: crypto.randomUUID(),
      title: title.trim(),
      due: 'Choose date',
      source: get().todoistConnected ? 'todoist' : 'internal',
      subtasks: [{ id: crypto.randomUUID(), text: 'Define first concrete step', done: false }]
    };
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      return addMemory({ ...canvas, taskGroups: [group, ...canvas.taskGroups] }, `Task group added: ${group.title}`, 'decision');
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  removeTaskGroup: (taskGroupId) => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      const target = canvas.taskGroups.find((task) => task.id === taskGroupId);
      if (!target) return canvas;
      return addMemory({ ...canvas, taskGroups: canvas.taskGroups.filter((task) => task.id !== taskGroupId) }, `Task group removed: ${target.title}`, 'decision');
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  addSubTask: (taskGroupId, text) => {
    if (!text.trim()) return;
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      return {
        ...canvas,
        taskGroups: canvas.taskGroups.map((group) =>
          group.id !== taskGroupId ? group : { ...group, subtasks: [...group.subtasks, { id: crypto.randomUUID(), text: text.trim(), done: false }] }
        )
      };
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  removeSubTask: (taskGroupId, subTaskId) => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      return {
        ...canvas,
        taskGroups: canvas.taskGroups.map((group) =>
          group.id !== taskGroupId ? group : { ...group, subtasks: group.subtasks.filter((step) => step.id !== subTaskId) }
        )
      };
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  toggleSubTask: (taskGroupId, subTaskId) => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      const updated = {
        ...canvas,
        taskGroups: canvas.taskGroups.map((group) =>
          group.id !== taskGroupId
            ? group
            : {
                ...group,
                subtasks: group.subtasks.map((step) => (step.id !== subTaskId ? step : { ...step, done: !step.done }))
              }
        )
      };
      return setStatusFromAssessment(updated);
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  acceptRecommendation: (recommendationId, canvasId) => {
    const targetCanvasId = canvasId ?? get().activeCanvasId;
    if (targetCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== targetCanvasId) return canvas;
      const recommendation = canvas.recommendations.find((item) => item.id === recommendationId);
      if (!recommendation) return canvas;
      let updated: Canvas = {
        ...canvas,
        recommendations: canvas.recommendations.map((item) => (item.id === recommendationId ? { ...item, state: 'accepted' } : item))
      };
      if (recommendation.actionType === 'internal_task') {
        updated = {
          ...updated,
          taskGroups: [
            {
              id: crypto.randomUUID(),
              title: recommendation.title,
              due: 'Today 8:00 PM',
              source: 'internal',
              subtasks: [
                { id: crypto.randomUUID(), text: 'Execute recommendation outcome', done: false },
                { id: crypto.randomUUID(), text: 'Capture final result', done: false }
              ]
            },
            ...updated.taskGroups
          ]
        };
      }
      if (recommendation.actionType === 'calendar_event') {
        updated = {
          ...updated,
          calendar: [
            ...updated.calendar,
            { id: crypto.randomUUID(), title: 'Protected focus block (Agent recommendation)', day: 'Wed', time: '6:30 PM - 8:30 PM', type: 'recommended' }
          ]
        };
      }
      return setStatusFromAssessment(addMemory(updated, `Accepted recommendation: ${recommendation.title}`, 'decision'));
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  requestDismissRecommendation: (recommendationId, canvasId) => {
    const target = canvasId ?? get().activeCanvasId;
    if (target === 'global') return;
    set({ pendingDismissFor: { recommendationId, canvasId: target }, dismissReason: '' });
  },

  setDismissReason: (value) => set({ dismissReason: value }),

  confirmDismissRecommendation: () => {
    const { pendingDismissFor, dismissReason } = get();
    if (!pendingDismissFor || !dismissReason.trim()) return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== pendingDismissFor.canvasId) return canvas;
      const rec = canvas.recommendations.find((item) => item.id === pendingDismissFor.recommendationId);
      if (!rec) return canvas;
      return addMemory(
        {
          ...canvas,
          recommendations: canvas.recommendations.map((item) =>
            item.id === pendingDismissFor.recommendationId ? { ...item, state: 'dismissed' } : item
          )
        },
        `Dismissed "${rec.title}" because: ${dismissReason}`,
        'decision'
      );
    });
    persistCanvases(canvases);
    set({ canvases, pendingDismissFor: null, dismissReason: '' });
  },

  cancelDismissRecommendation: () => set({ pendingDismissFor: null, dismissReason: '' }),

  assessNow: async () => {
    if (get().activeCanvasId === 'global') return;
    set({ assessing: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      return setStatusFromAssessment(
        addMemory({ ...canvas, assessment: generateAssessment(canvas) }, 'Assessment refreshed with latest trajectory signals.', 'insight')
      );
    });
    persistCanvases(canvases);
    set({ canvases, assessing: false });
  },

  addInboxItem: () => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      const item: InboxItem = {
        id: crypto.randomUUID(),
        source: 'school',
        title: 'Manual signal: Family concern about weekend overload',
        excerpt: 'Parent requests lighter Thursday schedule to preserve Friday test energy.',
        date: 'Just now',
        actionable: true,
        importance: 'medium',
        suggestedActionType: 'create_task'
      };
      return {
        ...canvas,
        inbox: [item, ...canvas.inbox]
      };
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  removeInboxItem: () => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      return { ...canvas, inbox: canvas.inbox.slice(1) };
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  generateDemoRecommendations: () => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      if (canvas.recommendations.some((rec) => rec.state === 'pending')) return canvas;
      const updatedCanvas: Canvas = {
        ...canvas,
        recommendations: generatedRecommendationsFor(canvas)
      };
      return updatedCanvas;
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  captureMemoryFromLastAssistant: () => {
    if (get().activeCanvasId === 'global') return;
    const canvases = get().canvases.map((canvas) => {
      if (canvas.id !== get().activeCanvasId) return canvas;
      const message = [...canvas.chat].reverse().find((m) => m.role === 'assistant');
      if (!message) return canvas;
      const lower = message.text.toLowerCase();
      const type: Memory['type'] = lower.includes('avoid') || lower.includes('no ') ? 'constraint' : lower.includes('decide') ? 'decision' : 'principle';
      const memory: Memory = {
        id: crypto.randomUUID(),
        type,
        text: message.text.split('\n')[0].slice(0, 180),
        createdAt: new Date().toLocaleString(),
        sourceMessageId: message.id
      };
      return { ...canvas, memories: [memory, ...canvas.memories].slice(0, 12) };
    });
    persistCanvases(canvases);
    set({ canvases });
  },

  addFeedback: (rating, category, notes) => {
    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      rating,
      category,
      notes,
      createdAt: new Date().toLocaleString()
    };
    const feedback = [entry, ...get().feedback];
    persistFeedback(feedback);
    set({ feedback });
  },

  resetDemo: () => {
    const canvases = cloneSeed();
    const feedback = [...seedFeedback];
    localStorage.setItem(DATA_KEY, JSON.stringify(canvases));
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
    set({
      canvases,
      feedback,
      activeCanvasId: 'global',
      activeCanvasTab: 'focus',
      isCanvasSwitcherOpen: false,
      isChatOpen: false,
      inboxFilter: 'all',
      pendingDismissFor: null,
      dismissReason: '',
      feedbackOpen: false,
      todoistConnected: false
    });
  }
}));
