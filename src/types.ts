export type AppTab = 'canvas' | 'focus' | 'goals' | 'todo' | 'inbox';
export type MobileNav = 'focus' | 'canvases' | 'profile';

export interface Profile {
  user_id: string;
  handle: string;
  display_name: string | null;
}

export interface Member {
  id: string;
  name?: string;
  email: string;
  role: 'viewer' | 'editor';
}

export interface ShareInfo {
  code: string;
  link: string;
}

export interface CanvasRecord {
  id: string;
  owner_user_id: string;
  name: string;
  subtitle: string;
  avatar_initials: string;
  status_label: 'On Track' | 'At Risk' | 'Behind';
  share_code: string;
  invite_link: string;
  members: Member[];
  created_at: string;
  updated_at: string;
}

export interface GoalRecord {
  id: string;
  canvas_id: string;
  title: string;
  summary: string;
  horizon: 'near_term' | 'this_quarter' | 'yearly';
  created_at: string;
}

export interface TodoRecord {
  id: string;
  canvas_id: string;
  text: string;
  is_done: boolean;
  created_at: string;
}

export interface Memory {
  id: string;
  canvas_id: string;
  type: 'principle' | 'constraint' | 'decision';
  text: string;
  created_at: string;
  source_message_id?: string | null;
}

export interface Recommendation {
  id: string;
  canvasId: string;
  title: string;
  rationale: string;
  source: 'gmail' | 'calendar' | 'internal';
  primaryActionType: 'run' | 'draft' | 'schedule' | 'create_task';
  createdAt: string;
}

export interface InboxItem {
  id: string;
  canvasId: string;
  source: 'gmail' | 'calendar' | 'school';
  title: string;
  body: string;
  time: string;
  suggestedActionType: 'draft_reply' | 'add_to_calendar' | 'create_task';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
