import { supabase } from '../lib/supabaseClient';
import type { CanvasRecord, GoalRecord, Memory, Profile, TodoRecord } from '../types';

type CanvasTableName = 'canvases' | 'canvasas';
let resolvedCanvasTable: CanvasTableName | null = null;

async function resolveCanvasTable(): Promise<CanvasTableName> {
  if (resolvedCanvasTable) return resolvedCanvasTable;

  const canvasesProbe = await supabase.from('canvases').select('id').limit(1);
  if (!canvasesProbe.error) {
    resolvedCanvasTable = 'canvases';
    return resolvedCanvasTable;
  }

  const canvasasProbe = await supabase.from('canvasas').select('id').limit(1);
  if (!canvasasProbe.error) {
    resolvedCanvasTable = 'canvasas';
    return resolvedCanvasTable;
  }

  throw canvasesProbe.error ?? canvasasProbe.error ?? new Error('Could not resolve canvases table');
}

export async function ensureProfile(userId: string, email?: string): Promise<Profile> {
  const { data: existing } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (existing) return existing as Profile;

  const baseHandle = email?.split('@')[0]?.toLowerCase()?.replace(/[^a-z0-9_]/g, '') || 'user';
  let handle = baseHandle;
  for (let i = 0; i < 20; i += 1) {
    const trial = i === 0 ? handle : `${baseHandle}${i}`;
    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id: userId, handle: trial, display_name: email?.split('@')[0] ?? 'User' })
      .select('*')
      .single();
    if (!error && data) return data as Profile;
    handle = trial;
  }
  throw new Error('Could not create profile');
}

export async function listCanvases(userId: string): Promise<CanvasRecord[]> {
  const table = await resolveCanvasTable();
  const { data, error } = await supabase.from(table).select('*').eq('owner_user_id', userId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CanvasRecord[];
}

export async function createCanvas(userId: string, canvas: Partial<CanvasRecord>): Promise<CanvasRecord> {
  const table = await resolveCanvasTable();
  const payload = {
    owner_user_id: userId,
    name: canvas.name ?? 'New Canvas',
    subtitle: canvas.subtitle ?? 'Define goals and execution plan',
    avatar_initials: canvas.avatar_initials ?? 'NC',
    status_label: canvas.status_label ?? 'At Risk',
    share_code: canvas.share_code ?? `CV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    invite_link: canvas.invite_link ?? `https://canvas.demo/invite/${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    members: canvas.members ?? []
  };

  const { data, error } = await supabase.from(table).insert(payload).select('*').single();
  if (error) throw error;
  return data as CanvasRecord;
}

export async function updateCanvas(canvasId: string, patch: Partial<CanvasRecord>): Promise<CanvasRecord> {
  const table = await resolveCanvasTable();
  const { data, error } = await supabase.from(table).update(patch).eq('id', canvasId).select('*').single();
  if (error) throw error;
  return data as CanvasRecord;
}

export async function deleteCanvas(canvasId: string): Promise<void> {
  const table = await resolveCanvasTable();
  const { error } = await supabase.from(table).delete().eq('id', canvasId);
  if (error) throw error;
}

export async function listGoals(canvasId: string): Promise<GoalRecord[]> {
  const { data, error } = await supabase.from('goals').select('*').eq('canvas_id', canvasId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as GoalRecord[];
}

export async function addGoal(canvasId: string, title: string, summary = 'Goal added from UI'): Promise<GoalRecord> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ canvas_id: canvasId, title, summary, horizon: 'this_quarter' })
    .select('*')
    .single();
  if (error) throw error;
  return data as GoalRecord;
}

export async function removeGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;
}

export async function listTodos(canvasId: string): Promise<TodoRecord[]> {
  const { data, error } = await supabase.from('todos').select('*').eq('canvas_id', canvasId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as TodoRecord[];
}

export async function addTodo(canvasId: string, text: string): Promise<TodoRecord> {
  const { data, error } = await supabase.from('todos').insert({ canvas_id: canvasId, text, is_done: false }).select('*').single();
  if (error) throw error;
  return data as TodoRecord;
}

export async function toggleTodo(todoId: string, isDone: boolean): Promise<TodoRecord> {
  const { data, error } = await supabase.from('todos').update({ is_done: isDone }).eq('id', todoId).select('*').single();
  if (error) throw error;
  return data as TodoRecord;
}

export async function removeTodo(todoId: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', todoId);
  if (error) throw error;
}

export async function listMemories(canvasId: string): Promise<Memory[]> {
  const { data, error } = await supabase.from('memories').select('*').eq('canvas_id', canvasId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Memory[];
}

export async function addMemory(canvasId: string, type: Memory['type'], text: string, sourceMessageId?: string): Promise<Memory> {
  const { data, error } = await supabase
    .from('memories')
    .insert({ canvas_id: canvasId, type, text, source_message_id: sourceMessageId ?? null })
    .select('*')
    .single();
  if (error) throw error;
  return data as Memory;
}

export async function removeMemory(memoryId: string): Promise<void> {
  const { error } = await supabase.from('memories').delete().eq('id', memoryId);
  if (error) throw error;
}
