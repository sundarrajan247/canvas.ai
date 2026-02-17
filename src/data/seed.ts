import type { InboxItem, Recommendation } from '../types';

const now = () => new Date().toLocaleString();

export const seededRecommendations = (canvasId: string, canvasName: string): Recommendation[] => [
  {
    id: `${canvasId}-rec-1`,
    canvasId,
    title: `Prioritize one protected execution block for ${canvasName}`,
    rationale: 'Current trajectory improves most when one high-focus block is explicitly reserved.',
    source: 'calendar',
    primaryActionType: 'schedule',
    createdAt: now()
  },
  {
    id: `${canvasId}-rec-2`,
    canvasId,
    title: 'Draft stakeholder alignment update',
    rationale: 'A concise update reduces coordination drift and keeps support tight.',
    source: 'gmail',
    primaryActionType: 'draft',
    createdAt: now()
  },
  {
    id: `${canvasId}-rec-3`,
    canvasId,
    title: 'Convert risk signal into trackable task',
    rationale: 'Turning fuzzy risk into a concrete task keeps momentum measurable.',
    source: 'internal',
    primaryActionType: 'create_task',
    createdAt: now()
  }
];

export const seededInboxForCanvas = (canvasId: string): InboxItem[] => [
  {
    id: `${canvasId}-inbox-1`,
    canvasId,
    source: 'gmail',
    title: 'Teacher follow-up requested this week',
    body: 'Please share a short readiness update and timeline by tomorrow.',
    time: 'Today 9:18 AM',
    suggestedActionType: 'draft_reply'
  },
  {
    id: `${canvasId}-inbox-2`,
    canvasId,
    source: 'calendar',
    title: 'Upcoming milestone event this Friday',
    body: 'No preparation block currently reserved before the event.',
    time: 'This Friday',
    suggestedActionType: 'add_to_calendar'
  },
  {
    id: `${canvasId}-inbox-3`,
    canvasId,
    source: 'school',
    title: 'Connector import: rubric signal dropped',
    body: 'Weakness concentrated in structure and consistency criteria.',
    time: 'Today 7:05 AM',
    suggestedActionType: 'create_task'
  }
];
