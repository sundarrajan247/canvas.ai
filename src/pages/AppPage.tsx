
import { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Calendar,
  ChevronRight,
  Copy,
  LogOut,
  Mail,
  Menu,
  Moon,
  MoreHorizontal,
  School,
  Search,
  Settings2,
  Sparkles,
  Sun,
  UserCircle2,
  X
} from 'lucide-react';
import type { AppTab, Canvas, Recommendation, SourceType } from '../types';
import { useDemoStore } from '../state/store';

type MobileNav = 'focus' | 'canvases' | 'profile';
const NAV_HEIGHT = 72;
const SAFE_BOTTOM = 'env(safe-area-inset-bottom, 0px)';

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'focus', label: 'Focus' },
  { id: 'goals', label: 'Goals' },
  { id: 'todo', label: 'Todo' },
  { id: 'inbox', label: 'Inbox' }
];

const recScore = (r: Recommendation) => (r.urgency === 'high' ? 3 : r.urgency === 'medium' ? 2 : 1) + (r.risk === 'high' ? 3 : r.risk === 'medium' ? 2 : 1);
const recTone = (risk: Recommendation['risk']) => (risk === 'high' ? 'border-l-amber-400' : risk === 'medium' ? 'border-l-sky-400' : 'border-l-emerald-400');
const recIcon = (source: Recommendation['source']) => (source === 'calendar' ? Calendar : source === 'gmail' ? Mail : Sparkles);
const inboxIcon = (source: SourceType) => (source === 'gmail' ? Mail : source === 'calendar' ? Calendar : School);
const sourceTone = (source: SourceType, dark: boolean) => {
  if (source === 'gmail') return dark ? 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (source === 'calendar') return dark ? 'bg-sky-500/15 text-sky-200 border-sky-400/30' : 'bg-sky-50 text-sky-700 border-sky-200';
  return dark ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
};
const memoryTagTone = (t: 'principle' | 'constraint' | 'decision', dark: boolean) => {
  if (t === 'principle') return dark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-700';
  if (t === 'constraint') return dark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-700';
  return dark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-700';
};

const modeHint = (tab: AppTab) => {
  if (tab === 'canvas') return 'Canvas mode: manage integrations, members, and state.';
  if (tab === 'goals') return 'Goals mode: refine milestones and capture durable takeaways.';
  if (tab === 'todo') return 'Todo mode: convert intent into concrete execution steps.';
  if (tab === 'inbox') return 'Inbox mode: triage incoming signals and rank response urgency.';
  return 'Focus mode: prioritize and execute highest leverage actions.';
};

function RecommendationCard({ recommendation, canvasName, dark, onAccept, onDismiss }: { recommendation: Recommendation; canvasName?: string; dark: boolean; onAccept: () => void; onDismiss: () => void }) {
  const Icon = recIcon(recommendation.source);
  return (
    <article className={`rounded-2xl border border-l-4 ${recTone(recommendation.risk)} p-4 shadow-sm ${dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white'}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {canvasName ? <p className={`mb-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{canvasName}</p> : null}
          <h3 className={`truncate text-base font-semibold ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{recommendation.title}</h3>
        </div>
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${dark ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-600'}`}><Icon size={16} /></span>
      </div>
      <p className={`line-clamp-2 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{recommendation.rationale}</p>
      <div className="mt-3 flex justify-end gap-2">
        <button className={`min-h-11 rounded-xl border px-3 py-2 text-sm ${dark ? 'border-white/15 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`} onClick={onDismiss}>Dismiss</button>
        <button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm font-medium text-white" onClick={onAccept}>Run action</button>
      </div>
    </article>
  );
}

export function AppPage() {
  const theme = useDemoStore((s) => s.theme);
  const dark = theme === 'dark';
  const canvases = useDemoStore((s) => s.canvases);
  const activeCanvasId = useDemoStore((s) => s.activeCanvasId);
  const activeCanvasTab = useDemoStore((s) => s.activeCanvasTab);
  const isCanvasSwitcherOpen = useDemoStore((s) => s.isCanvasSwitcherOpen);
  const isChatOpen = useDemoStore((s) => s.isChatOpen);
  const chatInput = useDemoStore((s) => s.chatInput);
  const typing = useDemoStore((s) => s.typing);
  const pendingDismissFor = useDemoStore((s) => s.pendingDismissFor);
  const dismissReason = useDemoStore((s) => s.dismissReason);
  const inboxFilter = useDemoStore((s) => s.inboxFilter);
  const assessing = useDemoStore((s) => s.assessing);

  const toggleTheme = useDemoStore((s) => s.toggleTheme);
  const logout = useDemoStore((s) => s.logout);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const setActiveCanvasId = useDemoStore((s) => s.setActiveCanvasId);
  const setActiveCanvasTab = useDemoStore((s) => s.setActiveCanvasTab);
  const setCanvasSwitcherOpen = useDemoStore((s) => s.setCanvasSwitcherOpen);
  const setChatOpen = useDemoStore((s) => s.setChatOpen);
  const setChatInput = useDemoStore((s) => s.setChatInput);
  const sendChatMessage = useDemoStore((s) => s.sendChatMessage);
  const runAssistant = useDemoStore((s) => s.runAssistant);
  const addCanvas = useDemoStore((s) => s.addCanvas);
  const renameActiveCanvas = useDemoStore((s) => s.renameActiveCanvas);
  const setActiveCanvasInitials = useDemoStore((s) => s.setActiveCanvasInitials);
  const addMemberToActiveCanvas = useDemoStore((s) => s.addMemberToActiveCanvas);
  const setIntegrationConnection = useDemoStore((s) => s.setIntegrationConnection);
  const assessNow = useDemoStore((s) => s.assessNow);
  const addGoal = useDemoStore((s) => s.addGoal);
  const removeGoal = useDemoStore((s) => s.removeGoal);
  const addTaskGroup = useDemoStore((s) => s.addTaskGroup);
  const removeTaskGroup = useDemoStore((s) => s.removeTaskGroup);
  const addSubTask = useDemoStore((s) => s.addSubTask);
  const removeSubTask = useDemoStore((s) => s.removeSubTask);
  const toggleSubTask = useDemoStore((s) => s.toggleSubTask);
  const acceptRecommendation = useDemoStore((s) => s.acceptRecommendation);
  const requestDismissRecommendation = useDemoStore((s) => s.requestDismissRecommendation);
  const setDismissReason = useDemoStore((s) => s.setDismissReason);
  const confirmDismissRecommendation = useDemoStore((s) => s.confirmDismissRecommendation);
  const cancelDismissRecommendation = useDemoStore((s) => s.cancelDismissRecommendation);
  const setInboxFilter = useDemoStore((s) => s.setInboxFilter);
  const generateDemoRecommendations = useDemoStore((s) => s.generateDemoRecommendations);
  const captureMemoryFromLastAssistant = useDemoStore((s) => s.captureMemoryFromLastAssistant);

  const [mobileNav, setMobileNav] = useState<MobileNav>('focus');
  const [canvasSearch, setCanvasSearch] = useState('');
  const [newCanvasName, setNewCanvasName] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [todoInput, setTodoInput] = useState('');
  const [subTaskDrafts, setSubTaskDrafts] = useState<Record<string, string>>({});
  const [canvasNameDraft, setCanvasNameDraft] = useState('');
  const [canvasInitialsDraft, setCanvasInitialsDraft] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { document.body.dataset.theme = theme; }, [theme]);
  useEffect(() => { if (mobileNav === 'canvases') setCanvasSwitcherOpen(true); }, [mobileNav, setCanvasSwitcherOpen]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1400);
    return () => clearTimeout(t);
  }, [toast]);
  const activeCanvas = useMemo<Canvas | undefined>(() => (activeCanvasId === 'global' ? undefined : canvases.find((c) => c.id === activeCanvasId)), [activeCanvasId, canvases]);
  useEffect(() => {
    if (!activeCanvas) return;
    setCanvasNameDraft(activeCanvas.name);
    setCanvasInitialsDraft(activeCanvas.avatarInitials);
  }, [activeCanvas?.id, activeCanvas?.name, activeCanvas?.avatarInitials]);

  const focusRecommendations = useMemo(() => {
    if (activeCanvasId === 'global') return canvases.flatMap((c) => c.recommendations.filter((r) => r.state === 'pending').map((recommendation) => ({ recommendation, canvasId: c.id, canvasName: c.name }))).sort((a, b) => recScore(b.recommendation) - recScore(a.recommendation));
    const c = canvases.find((it) => it.id === activeCanvasId);
    if (!c) return [];
    return c.recommendations.filter((r) => r.state === 'pending').map((recommendation) => ({ recommendation, canvasId: c.id, canvasName: c.name })).sort((a, b) => recScore(b.recommendation) - recScore(a.recommendation));
  }, [activeCanvasId, canvases]);

  const visibleCanvases = useMemo(() => {
    const q = canvasSearch.trim().toLowerCase();
    return q ? canvases.filter((c) => c.name.toLowerCase().includes(q)) : canvases;
  }, [canvasSearch, canvases]);

  const filteredInbox = useMemo(() => {
    if (!activeCanvas) return [];
    return inboxFilter === 'all' ? activeCanvas.inbox : activeCanvas.inbox.filter((i) => i.source === inboxFilter);
  }, [activeCanvas, inboxFilter]);

  const topInboxActions = useMemo(() => filteredInbox.filter((i) => i.actionable).slice(0, 3), [filteredInbox]);

  const panel = dark ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4' : 'rounded-2xl border border-slate-200 bg-white p-4';
  const control = dark ? 'min-h-11 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5' : 'min-h-11 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100';

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast('Copied');
    } catch {
      setToast('Copy failed');
    }
  };

  const onInboxAction = (itemId: string, source: SourceType) => {
    if (!activeCanvas) return;
    if (source === 'gmail') {
      setActiveCanvasTab('inbox');
      setChatInput(`Draft reply for inbox item ${itemId}: include concise next steps and owner.`);
      setChatOpen(true);
      return;
    }
    if (source === 'calendar') {
      addTaskGroup('Calendar follow-up from inbox signal');
      setToast('Added to plan');
      return;
    }
    addTaskGroup('School signal converted to task');
    setToast('Task created');
  };

  const submitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCanvasId === 'global') return;
    const prompt = chatInput.trim();
    if (!prompt) return;
    sendChatMessage(prompt);
    await runAssistant(`${modeHint(activeCanvasTab)}\n${prompt}`);
  };

  return (
    <main className={`${dark ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F9FAFB] text-slate-900'} min-h-screen transition-colors duration-300`}>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: `calc(${NAV_HEIGHT}px + ${SAFE_BOTTOM} + 16px)` }}>
          <div className="mx-auto max-w-3xl px-4 py-4">
            {mobileNav === 'focus' ? (
              <header className={`${panel} sticky top-3 z-20 mb-3 shadow-sm backdrop-blur-md`}>
                <div className="flex items-center gap-3">
                  <button className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-xs font-semibold text-white" onClick={() => setCanvasSwitcherOpen(true)}>{activeCanvas ? activeCanvas.avatarInitials : 'GL'}</button>
                  <button className="min-w-0 flex-1 text-left" onClick={() => setCanvasSwitcherOpen(true)}><p className="truncate text-sm font-semibold">{activeCanvas ? activeCanvas.name : 'Global'}</p><p className={`truncate text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{activeCanvas ? activeCanvas.subtitle : 'Unified recommendations across all canvases'}</p></button>
                  <button className={control} onClick={toggleTheme} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
                  <div className="relative"><button className={control} onClick={() => setOverflowOpen((v) => !v)}><MoreHorizontal size={18} /></button>{overflowOpen ? <div className={`absolute right-0 top-12 z-30 w-44 rounded-xl border p-1 shadow-lg ${dark ? 'border-white/10 bg-[#121826]' : 'border-slate-200 bg-white'}`}><button className={`${control} w-full border-0 text-left`} onClick={() => { setMobileNav('profile'); setOverflowOpen(false); }}>Settings</button><button className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10" onClick={logout}>Logout</button></div> : null}</div>
                </div>
              </header>
            ) : null}

            {mobileNav === 'focus' ? (
              <section className="space-y-3">
                {activeCanvas ? <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1">{tabs.map((tab) => <button key={tab.id} className={activeCanvasTab === tab.id ? 'min-h-11 shrink-0 rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white' : control} onClick={() => setActiveCanvasTab(tab.id)}>{tab.label}</button>)}</div> : null}

                {activeCanvas && activeCanvasTab === 'canvas' ? (
                  <>
                    <section className={panel}><h3 className="mb-3 text-base font-semibold">Canvas profile</h3><div className="space-y-2"><div className="flex gap-2"><input className={`${control} flex-1`} value={canvasNameDraft} onChange={(e) => setCanvasNameDraft(e.target.value)} placeholder="Canvas name" /><button className={control} onClick={() => renameActiveCanvas(canvasNameDraft)}>Save name</button></div><div className="flex gap-2"><input className={`${control} w-24 uppercase`} value={canvasInitialsDraft} onChange={(e) => setCanvasInitialsDraft(e.target.value.toUpperCase())} maxLength={2} placeholder="AB" /><button className={control} onClick={() => setActiveCanvasInitials(canvasInitialsDraft)}>Save avatar</button></div></div></section>
                    <section className={panel}><h3 className="mb-3 text-base font-semibold">Connectors</h3><div className="space-y-2">{([{ key: 'gmail', label: 'Gmail connector', helper: 'School emails tagged and surfaced in Inbox.', Icon: Mail }, { key: 'calendar', label: 'Calendar connector', helper: 'Upcoming events and conflicts feed Focus recommendations.', Icon: Calendar }, { key: 'school', label: 'School connector', helper: 'School updates and rubric signals are imported.', Icon: School }] as const).map(({ key, label, helper, Icon }) => <article key={key} className={`rounded-2xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}><div className="mb-2 flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${sourceTone(key, dark)}`}><Icon size={16} /></span><div><p className="text-sm font-medium">{label}</p><p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{helper}</p></div></div><span className={`rounded-full border px-2 py-0.5 text-[11px] ${activeCanvas.integrations[key] ? (dark ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200' : 'border-emerald-200 bg-emerald-50 text-emerald-700') : dark ? 'border-slate-500/40 bg-slate-600/20 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>{activeCanvas.integrations[key] ? 'Connected' : 'Not connected'}</span></div><button className={activeCanvas.integrations[key] ? control : 'min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white'} onClick={() => setIntegrationConnection(key, !activeCanvas.integrations[key])}>{activeCanvas.integrations[key] ? 'Disconnect' : 'Connect'}</button></article>)}</div></section>
                    <section className={panel}><h3 className="mb-3 text-base font-semibold">Sharing</h3><div className="space-y-3"><div className="rounded-xl border p-3"><p className="mb-1 text-xs text-slate-500">Share code</p><div className="flex items-center justify-between gap-2"><p className="font-mono text-sm">{activeCanvas.shareInfo.code}</p><button className={control} onClick={() => void copyText(activeCanvas.shareInfo.code)}><Copy size={14} /></button></div></div><div className="rounded-xl border p-3"><p className="mb-1 text-xs text-slate-500">Invite link</p><div className="flex items-center justify-between gap-2"><p className="truncate text-sm">{activeCanvas.shareInfo.link}</p><button className={control} onClick={() => void copyText(activeCanvas.shareInfo.link)}><Copy size={14} /></button></div></div><div className="rounded-xl border p-3"><p className="mb-2 text-sm font-medium">Members</p><div className="space-y-2">{activeCanvas.members.map((m) => <div key={m.id} className="flex items-center justify-between"><div><p className="text-sm">{m.name ?? m.email}</p><p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{m.email}</p></div><span className="text-xs uppercase text-slate-500">{m.role}</span></div>)}</div><form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!inviteEmail.trim()) return; addMemberToActiveCanvas(inviteEmail, inviteRole); setInviteEmail(''); setToast('Member invited'); }}><input className={`${control} flex-1`} placeholder="email@domain.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} /><select className={control} value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'viewer' | 'editor')}><option value="viewer">Viewer</option><option value="editor">Editor</option></select><button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Add</button></form></div></div></section>
                    <section className={panel}><h3 className="mb-2 text-base font-semibold">Current state assessment</h3><p className={`mb-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Status: {activeCanvas.statusLabel}</p><p className={`mb-2 text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>Last run: {activeCanvas.assessment.updatedAt}</p><div className="flex gap-2"><button className="min-h-11 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={() => void assessNow()} disabled={assessing}>{assessing ? 'Running...' : 'Run assessment'}</button><button className={control} onClick={resetDemo}>Reset demo</button></div></section>
                  </>
                ) : null}
                {activeCanvas && activeCanvasTab === 'focus' ? (
                  <>
                    <section className={panel}><h3 className="mb-2 text-base font-semibold">Status</h3><p className={`mb-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{activeCanvas.statusLabel}</p><p className={`mb-3 text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>Last assessment: {activeCanvas.assessment.updatedAt}</p><button className="min-h-11 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" onClick={() => void assessNow()} disabled={assessing}>{assessing ? 'Running...' : 'Run assessment'}</button></section>
                    {focusRecommendations.length > 0 ? focusRecommendations.map((item) => <RecommendationCard key={`${item.canvasId}-${item.recommendation.id}`} recommendation={item.recommendation} dark={dark} onAccept={() => acceptRecommendation(item.recommendation.id, item.canvasId)} onDismiss={() => requestDismissRecommendation(item.recommendation.id, item.canvasId)} />) : <section className={panel}><h3 className="mb-2 text-base font-semibold">Recommended actions</h3><p className={`mb-3 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>No pending recommendations. Generate demo items to populate the feed.</p><button className="min-h-11 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white" onClick={generateDemoRecommendations}>Generate demo recommendations</button></section>}
                  </>
                ) : null}

                {activeCanvas && activeCanvasTab === 'goals' ? (
                  <>
                    <section className={panel}><h3 className="mb-3 text-base font-semibold">Goals</h3><form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!goalInput.trim()) return; addGoal(goalInput.trim()); setGoalInput(''); }}><input className={`${control} flex-1`} value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="Add strategic goal" /><button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Add</button></form><div className="space-y-2">{activeCanvas.goals.map((goal) => <article key={goal.id} className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{goal.title}</p><p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{goal.summary}</p></div><button className="min-h-11 text-sm text-slate-400 hover:text-rose-400" onClick={() => removeGoal(goal.id)}>Remove</button></div></article>)}</div></section>
                    <section className={panel}><div className="mb-3 flex items-center justify-between"><h3 className="text-base font-semibold">Memories</h3><button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white" onClick={() => { captureMemoryFromLastAssistant(); setToast('Memory captured'); }}>Capture memory</button></div><div className="space-y-2">{activeCanvas.memories.map((m) => <article key={m.id} className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}><div className="mb-1 flex items-center justify-between"><span className={`rounded-full px-2 py-0.5 text-[11px] uppercase ${memoryTagTone(m.type, dark)}`}>{m.type}</span><span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{m.createdAt}</span></div><p className="text-sm">{m.text}</p>{m.sourceMessageId ? <button className="mt-2 text-xs text-indigo-500" onClick={() => { setActiveCanvasTab('goals'); setChatOpen(true); }}>Source: chat</button> : null}</article>)}</div></section>
                  </>
                ) : null}

                {activeCanvas && activeCanvasTab === 'todo' ? <section className={panel}><form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!todoInput.trim()) return; addTaskGroup(todoInput.trim()); setTodoInput(''); }}><input className={`${control} flex-1`} value={todoInput} onChange={(e) => setTodoInput(e.target.value)} placeholder="Add major todo group" /><button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white">Add</button></form><div className="space-y-2">{activeCanvas.taskGroups.map((group) => <article key={group.id} className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}><div className="mb-2 flex items-center justify-between"><p className="font-medium">{group.title}</p><button className="min-h-11 text-sm text-slate-400 hover:text-rose-400" onClick={() => removeTaskGroup(group.id)}>Remove</button></div><div className="space-y-2">{group.subtasks.map((step) => <label key={step.id} className={`min-h-11 flex items-center gap-2 rounded-xl border px-3 py-2 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'}`}><input type="checkbox" checked={step.done} onChange={() => toggleSubTask(group.id, step.id)} /><span className={`flex-1 text-sm ${step.done ? 'line-through opacity-60' : ''}`}>{step.text}</span><button type="button" className="min-h-11 text-slate-400 hover:text-rose-400" onClick={() => removeSubTask(group.id, step.id)}><X size={14} /></button></label>)}</div><form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = subTaskDrafts[group.id]?.trim() ?? ''; if (!v) return; addSubTask(group.id, v); setSubTaskDrafts((s) => ({ ...s, [group.id]: '' })); }}><input className={`${control} flex-1`} value={subTaskDrafts[group.id] ?? ''} onChange={(e) => setSubTaskDrafts((s) => ({ ...s, [group.id]: e.target.value }))} placeholder="Add sub-step" /><button className={control}>Add</button></form></article>)}</div></section> : null}

                {activeCanvas && activeCanvasTab === 'inbox' ? (
                  <section className={panel}>
                    <div className="mb-2 flex flex-wrap gap-2">{(['all', 'gmail', 'calendar', 'school'] as const).map((f) => <button key={f} className={inboxFilter === f ? 'min-h-11 rounded-lg border border-indigo-400/60 bg-indigo-500/15 px-3 py-2 text-xs text-indigo-200' : control} onClick={() => setInboxFilter(f)}>{f}</button>)}</div>
                    <div className="mb-3 no-scrollbar flex gap-2 overflow-x-auto">{topInboxActions.map((i) => <button key={`top-${i.id}`} className={`min-h-11 shrink-0 rounded-xl border px-3 py-2 text-left text-xs ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`} onClick={() => onInboxAction(i.id, i.source)}>{i.title}</button>)}</div>
                    <div className="space-y-2">{filteredInbox.map((item) => { const Icon = inboxIcon(item.source); const primary = item.suggestedActionType === 'draft_reply' ? 'Draft reply' : item.suggestedActionType === 'add_to_calendar' ? 'Add to calendar' : 'Create task'; return <article key={item.id} className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}><span className={`mb-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sourceTone(item.source, dark)}`}><Icon size={12} />{item.source}</span><p className="text-sm font-medium">{item.title}</p><p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{item.excerpt}</p><p className={`mt-1 text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{item.date}</p><p className={`mt-2 text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Suggested action: {primary}</p><div className="mt-2 flex gap-2"><button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white" onClick={() => onInboxAction(item.id, item.source)}>{primary}</button><button className={control} onClick={() => { setActiveCanvasTab('inbox'); setChatInput(`Help me act on inbox item: ${item.title}`); setChatOpen(true); }}>Ask AI</button></div></article>; })}</div>
                  </section>
                ) : null}
              </section>
            ) : null}

            {mobileNav === 'profile' ? <section className={panel}><h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Profile</h3><div className="space-y-2"><button className={`${control} flex w-full items-center gap-2`}><UserCircle2 size={15} />Account</button><button className={`${control} flex w-full items-center gap-2`}><Settings2 size={15} />Integrations</button><button className={`${control} flex w-full items-center gap-2`} onClick={toggleTheme}>{dark ? <Sun size={15} /> : <Moon size={15} />}Theme: {dark ? 'Dark' : 'Light'}</button><button className="min-h-11 flex w-full items-center gap-2 rounded-xl border border-rose-400/40 px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10" onClick={logout}><LogOut size={15} />Logout</button></div></section> : null}
          </div>
        </div>
      </div>
      <nav className={`fixed bottom-0 left-0 right-0 z-[90] border-t px-2 pt-2 ${dark ? 'border-white/10 bg-[#0F172A]/95' : 'border-slate-200 bg-white/95'} backdrop-blur-md`} style={{ paddingBottom: `calc(${SAFE_BOTTOM} + 8px)` }}>
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-2">
          <button className={mobileNav === 'focus' ? 'min-h-11 rounded-xl bg-indigo-500 text-xs text-white' : control} onClick={() => setMobileNav('focus')}><Sparkles size={15} className="mx-auto" />Focus</button>
          <button className={mobileNav === 'canvases' || isCanvasSwitcherOpen ? 'min-h-11 rounded-xl bg-indigo-500 text-xs text-white' : control} onClick={() => { setMobileNav('canvases'); setCanvasSwitcherOpen(true); }}><Menu size={15} className="mx-auto" />Canvases</button>
          <button className={mobileNav === 'profile' ? 'min-h-11 rounded-xl bg-indigo-500 text-xs text-white' : control} onClick={() => setMobileNav('profile')}><UserCircle2 size={15} className="mx-auto" />Profile</button>
        </div>
      </nav>

      <button className="fixed bottom-24 right-4 z-[95] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-[0_14px_28px_rgba(56,189,248,0.3)]" onClick={() => setChatOpen(true)}>
        <Bot size={18} className="absolute" />
        <Sparkles size={12} className="absolute -right-0.5 -top-0.5" />
      </button>

      {isCanvasSwitcherOpen ? <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-0"><section className={`h-full w-full overflow-auto p-4 ${dark ? 'bg-[#101726]' : 'bg-white'}`} style={{ paddingBottom: `calc(${NAV_HEIGHT}px + ${SAFE_BOTTOM} + 12px)` }}><div className="mx-auto max-w-2xl"><div className="mb-4 flex items-center justify-between gap-3"><h3 className={`text-lg font-semibold ${dark ? 'text-slate-100' : 'text-slate-900'}`}>Canvases</h3><button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white" onClick={() => { if (newCanvasName.trim()) addCanvas(newCanvasName.trim()); setNewCanvasName(''); setMobileNav('focus'); }}>+ New Canvas</button></div><div className="mb-4 flex items-center justify-between"><p className={`text-xs uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Select active canvas</p><button className={control} onClick={() => { setCanvasSwitcherOpen(false); setMobileNav('focus'); }}><X size={14} /></button></div><div className={`mb-3 flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 ${dark ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}><Search size={14} className={dark ? 'text-slate-400' : 'text-slate-500'} /><input className={`w-full bg-transparent text-sm outline-none ${dark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`} value={canvasSearch} onChange={(e) => setCanvasSearch(e.target.value)} placeholder="Search canvases" /></div><div className="mb-4"><input className={`${control} w-full`} value={newCanvasName} onChange={(e) => setNewCanvasName(e.target.value)} placeholder="Type name then tap + New Canvas" /></div><div className="space-y-1">{[{ id: 'global', name: 'Global', initials: 'GL' }, ...visibleCanvases.map((c) => ({ id: c.id, name: c.name, initials: c.avatarInitials }))].map((row) => <button key={row.id} className={`min-h-12 w-full rounded-xl border px-3 py-2 text-left ${activeCanvasId === row.id ? (dark ? 'border-indigo-400/40 bg-indigo-500/10' : 'border-indigo-200 bg-indigo-50') : dark ? 'border-white/10 hover:bg-white/[0.03]' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => { setActiveCanvasId(row.id); setMobileNav('focus'); }}><div className="flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-500 text-xs font-semibold text-white">{row.initials}</span><span className={`flex-1 truncate text-sm font-medium ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{row.name}</span>{activeCanvasId === row.id ? <span className={`rounded-full px-2 py-0.5 text-[11px] ${dark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>Active</span> : <ChevronRight size={16} className={dark ? 'text-slate-500' : 'text-slate-400'} />}</div></button>)}</div></div></section></div> : null}

      {isChatOpen ? <div className="fixed inset-0 z-[70] grid place-items-end bg-black/45 p-0"><section className={`h-[72vh] w-full rounded-t-2xl border p-4 ${dark ? 'border-white/10 bg-[#101726]' : 'border-slate-200 bg-white'}`}><div className="mb-3 flex items-center justify-between"><div><h3 className={`text-sm font-semibold uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Chat {activeCanvas ? `• ${activeCanvas.name}` : '• Global disabled'}</h3><p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{modeHint(activeCanvasTab)}</p></div><button className={control} onClick={() => setChatOpen(false)}><X size={14} /></button></div>{activeCanvas ? <><div className={`h-[calc(100%-120px)] overflow-auto rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>{activeCanvas.chat.map((m) => <article key={m.id} className={`mb-2 max-w-[88%] rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-500 text-white' : dark ? 'bg-white/[0.04] text-slate-200' : 'border border-slate-200 bg-white text-slate-800'}`}><p className="whitespace-pre-line">{m.text}</p><p className="mt-1 text-[11px] opacity-70">{m.timestamp}</p></article>)}{typing ? <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Agent run in progress...</p> : null}</div><form className="mt-3 flex gap-2" onSubmit={submitChat}><input className={`${control} flex-1`} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Message the canvas agent..." /><button className="min-h-11 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white">Send</button></form></> : <div className={`rounded-xl border p-4 text-sm ${dark ? 'border-white/10 bg-white/[0.03] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>Select a canvas from Canvases to open chat.</div>}</section></div> : null}

      {pendingDismissFor ? <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4"><form className={`${panel} w-full max-w-md`} onSubmit={(e) => { e.preventDefault(); confirmDismissRecommendation(); }}><h3 className="text-base font-semibold">Why dismiss this suggestion?</h3><textarea className={`${control} mt-3 h-24 w-full`} value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} placeholder="Add context so future recommendations improve" /><div className="mt-3 flex justify-end gap-2"><button type="button" className={control} onClick={cancelDismissRecommendation}>Cancel</button><button className="min-h-11 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white" type="submit" disabled={!dismissReason.trim()}>Save reason</button></div></form></div> : null}

      {toast ? <div className={`fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-xl px-3 py-2 text-sm shadow ${dark ? 'bg-white/10 text-slate-100' : 'bg-slate-900 text-white'}`}>{toast}</div> : null}
    </main>
  );
}
