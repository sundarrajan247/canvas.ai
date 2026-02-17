import { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  LogOut,
  Mail,
  Menu,
  Moon,
  Plus,
  Search,
  School,
  Sparkles,
  Sun,
  UserCircle2,
  X
} from 'lucide-react';
import { seededInboxForCanvas, seededRecommendations } from '../data/seed';
import { useAppStore } from '../state/store';
import type { AppTab, InboxItem } from '../types';

const NAV_HEIGHT = 72;
const SAFE_BOTTOM = 'env(safe-area-inset-bottom, 0px)';

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'focus', label: 'Focus' },
  { id: 'goals', label: 'Goals' },
  { id: 'todo', label: 'Todo' },
  { id: 'inbox', label: 'Inbox' }
];

const sourceIcon = (source: InboxItem['source']) => {
  if (source === 'gmail') return Mail;
  if (source === 'calendar') return Calendar;
  return School;
};

const modeHint = (tab: AppTab) => {
  if (tab === 'inbox') return 'Inbox mode: triage incoming signals and propose next actions.';
  if (tab === 'goals') return 'Goals mode: refine milestones and capture durable memory.';
  if (tab === 'todo') return 'Todo mode: convert intent into executable steps.';
  if (tab === 'canvas') return 'Canvas mode: configure this canvas and high-level settings.';
  return 'Focus mode: prioritize highest leverage actions.';
};

export function AppPage() {
  const theme = useAppStore((state) => state.theme);
  const dark = theme === 'dark';

  const mobileNav = useAppStore((state) => state.mobileNav);
  const activeCanvasId = useAppStore((state) => state.activeCanvasId);
  const activeCanvasTab = useAppStore((state) => state.activeCanvasTab);
  const isCanvasSwitcherOpen = useAppStore((state) => state.isCanvasSwitcherOpen);
  const isChatOpen = useAppStore((state) => state.isChatOpen);
  const chatInput = useAppStore((state) => state.chatInput);
  const toast = useAppStore((state) => state.toast);

  const profile = useAppStore((state) => state.profile);
  const user = useAppStore((state) => state.user);
  const canvases = useAppStore((state) => state.canvases);

  const goalsByCanvas = useAppStore((state) => state.goalsByCanvas);
  const todosByCanvas = useAppStore((state) => state.todosByCanvas);
  const memoriesByCanvas = useAppStore((state) => state.memoriesByCanvas);
  const chatByCanvas = useAppStore((state) => state.chatByCanvas);

  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const logout = useAppStore((state) => state.logout);
  const setMobileNav = useAppStore((state) => state.setMobileNav);
  const setActiveCanvasId = useAppStore((state) => state.setActiveCanvasId);
  const setActiveCanvasTab = useAppStore((state) => state.setActiveCanvasTab);
  const setCanvasSwitcherOpen = useAppStore((state) => state.setCanvasSwitcherOpen);
  const setChatOpen = useAppStore((state) => state.setChatOpen);
  const setChatInput = useAppStore((state) => state.setChatInput);
  const setToast = useAppStore((state) => state.setToast);

  const updateCanvas = useAppStore((state) => state.updateCanvas);
  const createCanvas = useAppStore((state) => state.createCanvas);
  const deleteCanvas = useAppStore((state) => state.deleteCanvas);
  const setHandle = useAppStore((state) => state.setHandle);

  const addGoal = useAppStore((state) => state.addGoal);
  const removeGoal = useAppStore((state) => state.removeGoal);

  const addTodo = useAppStore((state) => state.addTodo);
  const toggleTodo = useAppStore((state) => state.toggleTodo);
  const removeTodo = useAppStore((state) => state.removeTodo);

  const addMemory = useAppStore((state) => state.addMemory);
  const removeMemory = useAppStore((state) => state.removeMemory);
  const sendChatMessage = useAppStore((state) => state.sendChatMessage);

  const [canvasSearch, setCanvasSearch] = useState('');
  const [newCanvasName, setNewCanvasName] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [memoryInput, setMemoryInput] = useState('');
  const [handleInput, setHandleInput] = useState(profile?.handle ?? 'supriya0506');

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setHandleInput(profile?.handle ?? 'supriya0506');
  }, [profile?.handle]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1400);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  const activeCanvas = useMemo(
    () => (activeCanvasId === 'global' ? undefined : canvases.find((canvas) => canvas.id === activeCanvasId)),
    [activeCanvasId, canvases]
  );

  const goals = activeCanvas ? goalsByCanvas[activeCanvas.id] ?? [] : [];
  const todos = activeCanvas ? todosByCanvas[activeCanvas.id] ?? [] : [];
  const memories = activeCanvas ? memoriesByCanvas[activeCanvas.id] ?? [] : [];
  const chat = activeCanvas ? chatByCanvas[activeCanvas.id] ?? [] : [];

  const hasCanvasContent = (canvasId: string) => {
    const goalCount = goalsByCanvas[canvasId]?.length ?? 0;
    const todoCount = todosByCanvas[canvasId]?.length ?? 0;
    const memoryCount = memoriesByCanvas[canvasId]?.length ?? 0;
    return goalCount + todoCount + memoryCount > 0;
  };

  const recommendations = useMemo(() => {
    if (activeCanvas) {
      if (!hasCanvasContent(activeCanvas.id)) return [];
      return seededRecommendations(activeCanvas.id, activeCanvas.name);
    }

    return canvases
      .filter((canvas) => hasCanvasContent(canvas.id))
      .flatMap((canvas) => seededRecommendations(canvas.id, canvas.name));
  }, [activeCanvas, canvases, goalsByCanvas, memoriesByCanvas, todosByCanvas]);

  const inbox = useMemo(() => {
    if (!activeCanvas) return [];
    if (!hasCanvasContent(activeCanvas.id)) return [];
    return seededInboxForCanvas(activeCanvas.id);
  }, [activeCanvas, goalsByCanvas, memoriesByCanvas, todosByCanvas]);

  const visibleCanvases = useMemo(() => {
    const query = canvasSearch.trim().toLowerCase();
    if (!query) return canvases;
    return canvases.filter((canvas) => canvas.name.toLowerCase().includes(query));
  }, [canvasSearch, canvases]);

  const shell = dark ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F9FAFB] text-slate-900';
  const panel = dark ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4' : 'rounded-2xl border border-slate-200 bg-white p-4';
  const ghost = dark
    ? 'min-h-11 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5'
    : 'min-h-11 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100';

  const submitChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeCanvas || !chatInput.trim()) return;
    await sendChatMessage(activeCanvas.id, chatInput.trim(), activeCanvasTab);
  };

  const captureMemory = async () => {
    if (!activeCanvas) return;
    const latestAssistant = [...chat].reverse().find((message) => message.role === 'assistant');
    if (!latestAssistant) return;
    await addMemory(activeCanvas.id, 'decision', latestAssistant.text, latestAssistant.id);
    setToast('Memory captured');
  };

  return (
    <main className={`${shell} min-h-screen transition-colors duration-300`}>
      <div className="mx-auto max-w-3xl px-4 py-4" style={{ paddingBottom: `calc(${NAV_HEIGHT}px + ${SAFE_BOTTOM} + 24px)` }}>
        {mobileNav === 'focus' ? (
          <>
            <section className={`${panel} mb-3 shadow-sm`}>
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-xs font-semibold text-white"
                  onClick={() => setCanvasSwitcherOpen(true)}
                >
                  {activeCanvas ? activeCanvas.avatar_initials : 'GL'}
                </button>
                <button className="min-w-0 flex-1 text-left" onClick={() => setCanvasSwitcherOpen(true)}>
                  <p className="truncate text-sm font-semibold">{activeCanvas ? activeCanvas.name : 'Global feed'}</p>
                  <p className={`truncate text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activeCanvas ? activeCanvas.subtitle : 'Recommendations across all canvases'}
                  </p>
                </button>
                <button className={ghost} onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </section>

            {activeCanvas ? (
              <div className="mb-3 flex gap-2 overflow-x-auto py-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={
                      activeCanvasTab === tab.id
                        ? 'min-h-11 shrink-0 rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white'
                        : `${ghost} shrink-0`
                    }
                    onClick={() => setActiveCanvasTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}

            {!activeCanvas || activeCanvasTab === 'focus' ? (
              <section className="space-y-3">
                <article className={panel}>
                  <h3 className="text-base font-semibold">Status snapshot</h3>
                  <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {activeCanvas ? activeCanvas.status_label : 'Global mode'}
                  </p>
                  <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>Last assessment: {new Date().toLocaleString()}</p>
                </article>

                {recommendations.map((item) => {
                  const Icon = item.source === 'calendar' ? Calendar : item.source === 'gmail' ? Mail : Sparkles;
                  return (
                    <article key={item.id} className={`${panel} border-l-4 border-l-indigo-400`}>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="text-base font-semibold">{item.title}</h4>
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                          <Icon size={15} />
                        </span>
                      </div>
                      <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{item.rationale}</p>
                      <div className="mt-3 flex justify-end gap-2">
                        <button className={ghost}>Dismiss</button>
                        <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Run action</button>
                      </div>
                    </article>
                  );
                })}
                {recommendations.length === 0 ? (
                  <article className={panel}>
                    <h4 className="text-base font-semibold">No recommendations yet</h4>
                    <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Add goals, todos, or memories in this canvas to generate focused suggestions.
                    </p>
                  </article>
                ) : null}
              </section>
            ) : null}

            {activeCanvas && activeCanvasTab === 'canvas' ? (
              <section className="space-y-3">
                <article className={panel}>
                  <h3 className="mb-3 text-base font-semibold">Canvas settings</h3>
                  <div className="space-y-2">
                    <input
                      className={`${ghost} w-full`}
                      value={activeCanvas.name}
                      onChange={(event) => void updateCanvas(activeCanvas.id, { name: event.target.value })}
                    />
                    <input
                      className={`${ghost} w-full`}
                      value={activeCanvas.subtitle}
                      onChange={(event) => void updateCanvas(activeCanvas.id, { subtitle: event.target.value })}
                    />
                    <div className="flex gap-2">
                      <button className={ghost} onClick={() => void copyText(activeCanvas.share_code, setToast)}>
                        <Copy size={15} className="mr-1 inline" /> Share code
                      </button>
                      <button className={ghost} onClick={() => void copyText(activeCanvas.invite_link, setToast)}>
                        <Copy size={15} className="mr-1 inline" /> Invite link
                      </button>
                    </div>
                    <button
                      className="min-h-11 rounded-xl border border-rose-400/40 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                      onClick={() => void deleteCanvas(activeCanvas.id)}
                    >
                      Delete canvas
                    </button>
                  </div>
                </article>
              </section>
            ) : null}

            {activeCanvas && activeCanvasTab === 'goals' ? (
              <section className="space-y-3">
                <article className={panel}>
                  <h3 className="mb-3 text-base font-semibold">Goals</h3>
                  <form
                    className="mb-3 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!goalInput.trim()) return;
                      void addGoal(activeCanvas.id, goalInput.trim());
                      setGoalInput('');
                    }}
                  >
                    <input className={`${ghost} flex-1`} value={goalInput} onChange={(event) => setGoalInput(event.target.value)} placeholder="Add goal" />
                    <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Add</button>
                  </form>
                  <div className="space-y-2">
                    {goals.map((goal) => (
                      <div key={goal.id} className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{goal.title}</p>
                            <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(goal.created_at).toLocaleString()}</p>
                          </div>
                          <button className="text-sm text-slate-400 hover:text-rose-400" onClick={() => void removeGoal(activeCanvas.id, goal.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className={panel}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">Memories</h3>
                    <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white" onClick={() => void captureMemory()}>
                      Capture memory
                    </button>
                  </div>
                  <form
                    className="mb-3 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!memoryInput.trim()) return;
                      void addMemory(activeCanvas.id, 'principle', memoryInput.trim());
                      setMemoryInput('');
                    }}
                  >
                    <input className={`${ghost} flex-1`} value={memoryInput} onChange={(event) => setMemoryInput(event.target.value)} placeholder="Add memory" />
                    <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Add</button>
                  </form>
                  <div className="space-y-2">
                    {memories.map((memory) => (
                      <div key={memory.id} className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs uppercase text-indigo-300">{memory.type}</span>
                          <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(memory.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{memory.text}</p>
                        <button className="mt-2 text-xs text-rose-400" onClick={() => void removeMemory(activeCanvas.id, memory.id)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            ) : null}

            {activeCanvas && activeCanvasTab === 'todo' ? (
              <section className={panel}>
                <h3 className="mb-3 text-base font-semibold">Todo</h3>
                <form
                  className="mb-3 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!todoInput.trim()) return;
                    void addTodo(activeCanvas.id, todoInput.trim());
                    setTodoInput('');
                  }}
                >
                  <input className={`${ghost} flex-1`} value={todoInput} onChange={(event) => setTodoInput(event.target.value)} placeholder="Add todo" />
                  <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Add</button>
                </form>
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <label
                      key={todo.id}
                      className={`min-h-11 flex items-center gap-2 rounded-xl border px-3 py-2 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <input type="checkbox" checked={todo.is_done} onChange={() => void toggleTodo(activeCanvas.id, todo.id)} />
                      <span className={`flex-1 text-sm ${todo.is_done ? 'line-through opacity-60' : ''}`}>{todo.text}</span>
                      <button type="button" className="text-sm text-slate-400 hover:text-rose-400" onClick={() => void removeTodo(activeCanvas.id, todo.id)}>
                        Remove
                      </button>
                    </label>
                  ))}
                </div>
              </section>
            ) : null}

            {activeCanvas && activeCanvasTab === 'inbox' ? (
              <section className={panel}>
                <h3 className="mb-3 text-base font-semibold">Inbox signals</h3>
                <div className="space-y-2">
                  {inbox.map((item) => {
                    const Icon = sourceIcon(item.source);
                    return (
                      <article key={item.id} className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="font-medium">{item.title}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${dark ? 'border-white/15 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                            <Icon size={12} /> {item.source}
                          </span>
                        </div>
                        <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{item.body}</p>
                        <p className={`mt-1 text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{item.time}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white"
                            onClick={() => {
                              const command =
                                item.suggestedActionType === 'draft_reply'
                                  ? 'Draft reply'
                                  : item.suggestedActionType === 'add_to_calendar'
                                    ? 'Add to calendar'
                                    : 'Create task';
                              setChatInput(`${command} for: ${item.title}`);
                              setChatOpen(true);
                            }}
                          >
                            Ask AI
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {inbox.length === 0 ? (
                    <article className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                      <p className="text-sm font-medium">Inbox is empty</p>
                      <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Connect sources and add goals to start receiving actionable signals.
                      </p>
                    </article>
                  ) : null}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {mobileNav === 'profile' ? (
          <section className={panel}>
            <h2 className="mb-3 text-base font-semibold">Profile</h2>
            <div className={`mb-3 rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <form
              className="mb-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void setHandle(handleInput);
                setToast('Handle updated');
              }}
            >
              <input className={`${ghost} flex-1`} value={handleInput} onChange={(event) => setHandleInput(event.target.value)} placeholder="Handle" />
              <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Save</button>
            </form>
            <p className={`mb-3 text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>Current handle: {profile?.handle ?? 'supriya0506'}</p>
            <button
              className="min-h-11 w-full rounded-xl border border-rose-400/40 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
              onClick={() => void logout()}
            >
              <LogOut size={15} className="mr-2 inline" /> Logout
            </button>
          </section>
        ) : null}
      </div>

      <nav
        className={`fixed bottom-0 left-0 right-0 z-[90] border-t px-2 pt-2 ${dark ? 'border-white/10 bg-[#0F172A]/95' : 'border-slate-200 bg-white/95'} backdrop-blur-md`}
        style={{ paddingBottom: `calc(${SAFE_BOTTOM} + 8px)` }}
      >
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-2">
          <button
            className={mobileNav === 'focus' ? 'min-h-11 rounded-xl bg-indigo-500 text-xs text-white' : ghost}
            onClick={() => setMobileNav('focus')}
          >
            <Sparkles size={15} className="mx-auto" />
            Focus
          </button>
          <button
            className={mobileNav === 'canvases' || isCanvasSwitcherOpen ? 'min-h-11 rounded-xl bg-indigo-500 text-xs text-white' : ghost}
            onClick={() => {
              setMobileNav('focus');
              setCanvasSwitcherOpen(true);
            }}
          >
            <Menu size={15} className="mx-auto" />
            Canvases
          </button>
          <button
            className={mobileNav === 'profile' ? 'min-h-11 rounded-xl bg-indigo-500 text-xs text-white' : ghost}
            onClick={() => setMobileNav('profile')}
          >
            <UserCircle2 size={15} className="mx-auto" />
            Profile
          </button>
        </div>
      </nav>

      <button
        className="fixed bottom-24 right-4 z-[95] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-[0_14px_28px_rgba(56,189,248,0.3)]"
        onClick={() => setChatOpen(true)}
      >
        <Bot size={18} className="absolute" />
        <Sparkles size={12} className="absolute -right-0.5 -top-0.5" />
      </button>

      {isCanvasSwitcherOpen ? (
        <div className="fixed inset-0 z-[80] bg-black/45">
          <section
            className={`h-full overflow-auto p-4 ${dark ? 'bg-[#101726]' : 'bg-white'}`}
            style={{ paddingBottom: `calc(${NAV_HEIGHT}px + ${SAFE_BOTTOM} + 12px)` }}
          >
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Canvases</h3>
                <button className={ghost} onClick={() => setCanvasSwitcherOpen(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className={`mb-3 flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 ${dark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                <Search size={14} className={dark ? 'text-slate-400' : 'text-slate-500'} />
                <input
                  className={`w-full bg-transparent text-sm outline-none ${dark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
                  value={canvasSearch}
                  onChange={(event) => setCanvasSearch(event.target.value)}
                  placeholder="Search canvases"
                />
              </div>

              <form
                className="mb-3 flex gap-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!newCanvasName.trim()) return;
                  const created = await createCanvas(newCanvasName.trim());
                  if (!created) return;
                  setNewCanvasName('');
                  setCanvasSwitcherOpen(false);
                }}
              >
                <input
                  className={`${ghost} flex-1`}
                  value={newCanvasName}
                  onChange={(event) => setNewCanvasName(event.target.value)}
                  placeholder="New canvas name"
                />
                <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">
                  <Plus size={14} className="mr-1 inline" /> New
                </button>
              </form>

              <div className="space-y-1">
                <button
                  className={`min-h-12 w-full rounded-xl border px-3 py-2 text-left ${activeCanvasId === 'global' ? (dark ? 'border-indigo-400/40 bg-indigo-500/10' : 'border-indigo-200 bg-indigo-50') : dark ? 'border-white/10 hover:bg-white/[0.03]' : 'border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => {
                    void setActiveCanvasId('global');
                    setCanvasSwitcherOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 text-xs font-semibold text-white">
                      GL
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">Global</span>
                    {activeCanvasId === 'global' ? <CheckCircle2 size={16} className="text-indigo-400" /> : <ChevronRight size={16} className={dark ? 'text-slate-500' : 'text-slate-400'} />}
                  </div>
                </button>
                {visibleCanvases.map((canvas) => (
                  <button
                    key={canvas.id}
                    className={`min-h-12 w-full rounded-xl border px-3 py-2 text-left ${activeCanvasId === canvas.id ? (dark ? 'border-indigo-400/40 bg-indigo-500/10' : 'border-indigo-200 bg-indigo-50') : dark ? 'border-white/10 hover:bg-white/[0.03]' : 'border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => {
                      void setActiveCanvasId(canvas.id);
                      setCanvasSwitcherOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 text-xs font-semibold text-white">
                        {canvas.avatar_initials}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium">{canvas.name}</span>
                      {activeCanvasId === canvas.id ? <CheckCircle2 size={16} className="text-indigo-400" /> : <ChevronRight size={16} className={dark ? 'text-slate-500' : 'text-slate-400'} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {isChatOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-black/45 p-0">
          <section className={`h-[72vh] w-full rounded-t-2xl border p-4 ${dark ? 'border-white/10 bg-[#101726]' : 'border-slate-200 bg-white'}`}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-semibold uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Chat {activeCanvas ? `• ${activeCanvas.name}` : '• Global disabled'}
                </h3>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{modeHint(activeCanvasTab)}</p>
              </div>
              <button className={ghost} onClick={() => setChatOpen(false)}>
                <X size={14} />
              </button>
            </div>

            {activeCanvas ? (
              <>
                <div className={`h-[calc(100%-120px)] overflow-auto rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                  {chat.map((message) => (
                    <article
                      key={message.id}
                      className={`mb-2 max-w-[88%] rounded-xl px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-indigo-500 text-white' : dark ? 'bg-white/[0.04] text-slate-200' : 'border border-slate-200 bg-white text-slate-800'}`}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>
                      <p className="mt-1 text-[11px] opacity-70">{message.timestamp}</p>
                    </article>
                  ))}
                </div>

                <form className="mt-3 flex gap-2" onSubmit={submitChat}>
                  <input
                    className={`${ghost} flex-1`}
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Message the canvas agent..."
                  />
                  <button className="min-h-11 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white">Send</button>
                </form>
              </>
            ) : (
              <div className={`rounded-xl border p-4 text-sm ${dark ? 'border-white/10 bg-white/[0.03] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                Select a canvas from Canvases to open chat.
              </div>
            )}
          </section>
        </div>
      ) : null}

      {toast ? <div className={`fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-xl px-3 py-2 text-sm shadow ${dark ? 'bg-white/10 text-slate-100' : 'bg-slate-900 text-white'}`}>{toast}</div> : null}
    </main>
  );
}

async function copyText(value: string, setToast: (text: string) => void) {
  try {
    await navigator.clipboard.writeText(value);
    setToast('Copied');
  } catch {
    setToast('Copy failed');
  }
}

