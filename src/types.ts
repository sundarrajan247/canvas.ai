export type CanvasStatus = 'on_track' | 'at_risk' | 'behind';
export type AppTab = 'canvas' | 'focus' | 'goals' | 'todo' | 'inbox';
export type AppViewMode = 'home' | 'canvas';
export type SourceType = 'gmail' | 'calendar' | 'school';
export type MemberRole = 'viewer' | 'editor';
export type SuggestedActionType = 'draft_reply' | 'add_to_calendar' | 'create_task';
export type RecommendationState = 'pending' | 'accepted' | 'dismissed';
export type RecommendationActionType = 'internal_task' | 'calendar_event' | 'email_draft';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface Goal {
  id: string;
  title: string;
  horizon: 'near_term' | 'this_quarter' | 'yearly';
  summary: string;
}

export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskGroup {
  id: string;
  title: string;
  due: string;
  source: SourceType | 'internal' | 'todoist';
  subtasks: SubTask[];
}

export interface InboxItem {
  id: string;
  source: SourceType;
  title: string;
  excerpt: string;
  date: string;
  actionable: boolean;
  importance: 'high' | 'medium' | 'low';
  suggestedActionType?: SuggestedActionType;
}

export interface CalendarEvent {
  id: string;
  title: string;
  day: string;
  time: string;
  type: 'existing' | 'recommended';
}

export interface Recommendation {
  id: string;
  title: string;
  urgency: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  rationale: string;
  details: string;
  source: SourceType | 'internal';
  actionType: RecommendationActionType;
  impact: string;
  state: RecommendationState;
  requiresApproval: boolean;
}

export interface MemoryEntry {
  id: string;
  text: string;
  type: 'preference' | 'decision' | 'insight';
  timestamp: string;
}

export interface Memory {
  id: string;
  type: 'principle' | 'constraint' | 'decision';
  text: string;
  createdAt: string;
  sourceMessageId?: string;
}

export interface Member {
  id: string;
  name?: string;
  email: string;
  role: MemberRole;
}

export interface ShareInfo {
  code: string;
  link: string;
}

export interface Assessment {
  updatedAt: string;
  goingWell: string[];
  improve: string[];
  watchouts: string[];
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface Canvas {
  id: string;
  name: string;
  avatarInitials: string;
  subtitle: string;
  status: CanvasStatus;
  statusLabel: string;
  shareInfo: ShareInfo;
  members: Member[];
  integrations: {
    gmail: boolean;
    calendar: boolean;
    school: boolean;
  };
  goals: Goal[];
  taskGroups: TaskGroup[];
  inbox: InboxItem[];
  calendar: CalendarEvent[];
  recommendations: Recommendation[];
  memory: MemoryEntry[];
  memories: Memory[];
  assessment: Assessment;
  chat: ChatMessage[];
}

export interface FeedRecommendation extends Recommendation {
  canvasId: string;
  canvasName: string;
}

export interface FeedbackEntry {
  id: string;
  rating: number;
  category: 'workflow' | 'mobile' | 'automation' | 'integrations' | 'design';
  notes: string;
  createdAt: string;
}
