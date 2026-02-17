import type { Canvas, FeedbackEntry } from '../types';

const now = () => new Date().toLocaleString();

export const seedCanvases: Canvas[] = [
  {
    id: 'vikram',
    name: 'Vikram Development',
    avatarInitials: 'VD',
    subtitle: 'Academic outcomes and family execution system',
    status: 'at_risk',
    statusLabel: 'At Risk',
    shareInfo: {
      code: 'VD-8K2P3Q',
      link: 'https://canvas.demo/invite/VD-8K2P3Q'
    },
    members: [
      { id: 'vm1', name: 'Priya S', email: 'priya@example.com', role: 'editor' },
      { id: 'vm2', name: 'Rohan S', email: 'rohan@example.com', role: 'viewer' }
    ],
    integrations: {
      gmail: true,
      calendar: true,
      school: true
    },
    goals: [
      {
        id: 'g1',
        title: 'Raise English writing performance to consistent A-range',
        horizon: 'this_quarter',
        summary: 'Shift from reactive cramming to rhythm-based writing practice with measurable feedback loops.'
      },
      {
        id: 'g2',
        title: 'Protect confidence under exam pressure',
        horizon: 'near_term',
        summary: 'Reduce last-minute stress with pre-committed prep blocks and parent-teacher check-ins.'
      }
    ],
    taskGroups: [
      {
        id: 'tg1',
        title: 'English Mock Test Readiness Sprint',
        due: 'Friday 9:00 AM',
        source: 'internal',
        subtasks: [
          { id: 's1', text: 'Timed essay: 45 minutes on argument prompt', done: false },
          { id: 's2', text: 'Review teacher rubric and mark weak criteria', done: true },
          { id: 's3', text: 'Revision pass focused on transitions + evidence', done: false }
        ]
      },
      {
        id: 'tg2',
        title: 'Parent-Teacher Communication Loop',
        due: 'Thursday 4:00 PM',
        source: 'gmail',
        subtasks: [
          { id: 's4', text: 'Draft concise prep update email', done: false },
          { id: 's5', text: 'Confirm Wednesday prep block completion', done: false }
        ]
      }
    ],
    inbox: [
      {
        id: 'i1',
        source: 'gmail',
        title: 'Teacher: English mock test moved to Friday',
        excerpt: 'Please ensure Vikram practices one timed essay at home before test day.',
        date: 'Today 9:18 AM',
        actionable: true,
        importance: 'high',
        suggestedActionType: 'draft_reply'
      },
      {
        id: 'i2',
        source: 'gmail',
        title: 'School Admin: Parent portal grade update available',
        excerpt: 'Latest writing rubric is now published in portal with comparative trends.',
        date: 'Yesterday 5:42 PM',
        actionable: true,
        importance: 'medium',
        suggestedActionType: 'draft_reply'
      },
      {
        id: 'i3',
        source: 'calendar',
        title: 'English Mock Test',
        excerpt: 'Friday at 10:00 AM, school campus. Arrive by 9:45 AM.',
        date: 'This Friday',
        actionable: true,
        importance: 'high',
        suggestedActionType: 'add_to_calendar'
      },
      {
        id: 'i4',
        source: 'school',
        title: 'School connector import: Writing rubric 64/100',
        excerpt: 'Weakest criteria: idea development and grammar consistency.',
        date: 'Today 7:05 AM',
        actionable: true,
        importance: 'high',
        suggestedActionType: 'create_task'
      }
    ],
    calendar: [
      { id: 'c1', title: 'Math Tuition', day: 'Tue', time: '5:00 PM - 6:00 PM', type: 'existing' },
      { id: 'c2', title: 'Soccer Practice', day: 'Thu', time: '6:15 PM - 7:15 PM', type: 'existing' },
      { id: 'c3', title: 'English Mock Test', day: 'Fri', time: '10:00 AM - 11:00 AM', type: 'existing' }
    ],
    recommendations: [
      {
        id: 'r1',
        title: 'Block a protected 2-hour English prep session on Wednesday',
        urgency: 'high',
        risk: 'high',
        rationale: 'No dedicated deep-work block exists before Friday despite low rubric performance.',
        details:
          'Create one focused block (6:30-8:30 PM) with structure: timed draft, rubric scoring, targeted revision.',
        source: 'calendar',
        actionType: 'calendar_event',
        impact: 'Improves readiness and reduces last-minute panic.',
        state: 'pending',
        requiresApproval: true
      },
      {
        id: 'r2',
        title: 'Spin up a daily micro-checklist for vocabulary + essay structure',
        urgency: 'medium',
        risk: 'medium',
        rationale: 'Inconsistency is the main pattern; checklist enforces a repeatable habit.',
        details: 'Create a 15-minute recurring checklist and track completion streak for 5 days.',
        source: 'internal',
        actionType: 'internal_task',
        impact: 'Better consistency and confidence.',
        state: 'pending',
        requiresApproval: false
      },
      {
        id: 'r3',
        title: 'Draft teacher update with explicit prep timeline',
        urgency: 'medium',
        risk: 'low',
        rationale: 'Teacher requested progress visibility before test day.',
        details: 'Draft now, review quickly, and send after Wednesday prep block is done.',
        source: 'gmail',
        actionType: 'email_draft',
        impact: 'Improves accountability and support quality.',
        state: 'pending',
        requiresApproval: true
      }
    ],
    memory: [
      { id: 'm1', text: 'Vikram responds well to evening prep when schedule is protected.', type: 'preference', timestamp: now() },
      { id: 'm2', text: 'Avoid introducing new heavy tasks after 9 PM.', type: 'preference', timestamp: now() },
      { id: 'm3', text: 'Confidence drops when essay feedback is delayed beyond 24 hours.', type: 'insight', timestamp: now() }
    ],
    memories: [
      { id: 'mm1', type: 'principle', text: 'Protect deep work before test day.', createdAt: now() },
      { id: 'mm2', type: 'constraint', text: 'No heavy tasks after 9 PM.', createdAt: now() },
      { id: 'mm3', type: 'decision', text: 'Focus on timed essay practice for two weeks.', createdAt: now() }
    ],
    assessment: {
      updatedAt: now(),
      goingWell: ['Math cadence is stable with consistent tuition attendance.', 'Family is actively engaging and responds quickly to recommendations.'],
      improve: ['No dedicated English deep-work block exists before mock test.', 'Teacher communication loop is not yet closed for this week.'],
      watchouts: ['Friday mock test at 10:00 AM with low rubric baseline.', 'Soccer on Thursday can reduce evening prep energy.']
    },
    chat: [
      {
        id: 'ch1',
        role: 'assistant',
        text: 'Agent scan complete: your highest-leverage move is to lock one prep block before Friday and align with teacher expectations.',
        timestamp: now()
      }
    ]
  },
  {
    id: 'relocation',
    name: 'California Relocation',
    avatarInitials: 'CR',
    subtitle: 'School selection, housing, and move execution',
    status: 'on_track',
    statusLabel: 'On Track',
    shareInfo: {
      code: 'CR-5N4T9A',
      link: 'https://canvas.demo/invite/CR-5N4T9A'
    },
    members: [{ id: 'rm1', name: 'Anita M', email: 'anita@example.com', role: 'editor' }],
    integrations: {
      gmail: false,
      calendar: true,
      school: false
    },
    goals: [
      {
        id: 'rg1',
        title: 'Finalize school decision with clear tradeoff matrix',
        horizon: 'near_term',
        summary: 'Move from broad options to one final decision with confidence and timeline certainty.'
      }
    ],
    taskGroups: [
      {
        id: 'rtg1',
        title: 'Relocation Decision Pack',
        due: 'Monday 11:00 AM',
        source: 'internal',
        subtasks: [
          { id: 'rs1', text: 'Compare commute + tuition + curriculum fit', done: true },
          { id: 'rs2', text: 'Schedule final school visit', done: false }
        ]
      }
    ],
    inbox: [
      {
        id: 'ri1',
        source: 'calendar',
        title: 'Lease review call with relocation advisor',
        excerpt: 'Thursday 2:00 PM. Bring school shortlist and budget constraints.',
        date: 'Thu 2:00 PM',
        actionable: true,
        importance: 'medium',
        suggestedActionType: 'add_to_calendar'
      }
    ],
    calendar: [{ id: 'rc1', title: 'Relocation Advisor Call', day: 'Thu', time: '2:00 PM - 2:45 PM', type: 'existing' }],
    recommendations: [
      {
        id: 'rr1',
        title: 'Generate one-page school comparison summary before advisor call',
        urgency: 'medium',
        risk: 'low',
        rationale: 'A structured summary will speed decision-making and reduce back-and-forth.',
        details: 'Focus on commute, fees, support services, and admissions timing.',
        source: 'internal',
        actionType: 'internal_task',
        impact: 'Increases decision speed.',
        state: 'pending',
        requiresApproval: false
      }
    ],
    memory: [{ id: 'rm1', text: 'Commute quality matters more than apartment size.', type: 'preference', timestamp: now() }],
    memories: [{ id: 'rmm1', type: 'principle', text: 'Prioritize school fit over apartment size.', createdAt: now() }],
    assessment: {
      updatedAt: now(),
      goingWell: ['School shortlist is nearly complete.', 'Advisor checkpoint is scheduled in time.'],
      improve: ['Final visit not locked yet.', 'Budget confidence for top choice still needs validation.'],
      watchouts: ['If final visit slips, move timeline may compress.']
    },
    chat: []
  },
  {
    id: 'career',
    name: 'Career Growth 2026',
    avatarInitials: 'CG',
    subtitle: 'Strategic skill growth and portfolio outcomes',
    status: 'behind',
    statusLabel: 'Behind',
    shareInfo: {
      code: 'CG-1L7M2D',
      link: 'https://canvas.demo/invite/CG-1L7M2D'
    },
    members: [{ id: 'cm1', name: 'Mentor Group', email: 'mentor@example.com', role: 'viewer' }],
    integrations: {
      gmail: false,
      calendar: true,
      school: false
    },
    goals: [
      {
        id: 'cg1',
        title: 'Publish flagship case study and improve visibility',
        horizon: 'this_quarter',
        summary: 'Convert draft work into a public artifact that improves interview and networking quality.'
      }
    ],
    taskGroups: [
      {
        id: 'ctg1',
        title: 'Case Study Launch Sprint',
        due: 'March 20',
        source: 'internal',
        subtasks: [
          { id: 'cs1', text: 'Outline narrative arc', done: false },
          { id: 'cs2', text: 'Design before/after artifact visuals', done: false },
          { id: 'cs3', text: 'Publish and share with mentor circle', done: false }
        ]
      }
    ],
    inbox: [
      {
        id: 'ci1',
        source: 'school',
        title: 'Portfolio review rubric updated',
        excerpt: 'Weight increased for storytelling clarity and artifact depth.',
        date: 'Today 8:10 AM',
        actionable: true,
        importance: 'medium',
        suggestedActionType: 'create_task'
      }
    ],
    calendar: [{ id: 'cc1', title: 'Mentor Sync', day: 'Wed', time: '8:00 PM - 8:30 PM', type: 'existing' }],
    recommendations: [
      {
        id: 'cr1',
        title: 'Reserve a protected 90-minute deep-work block this weekend',
        urgency: 'high',
        risk: 'high',
        rationale: 'Current execution cadence cannot hit the publish date.',
        details: 'Move low-priority commitments and lock one uninterrupted block.',
        source: 'calendar',
        actionType: 'calendar_event',
        impact: 'Restores delivery confidence.',
        state: 'pending',
        requiresApproval: true
      }
    ],
    memory: [{ id: 'cm1', text: 'Morning deep work produces highest-quality writing.', type: 'insight', timestamp: now() }],
    memories: [{ id: 'cmm1', type: 'decision', text: 'Reserve one protected deep-work block every weekend.', createdAt: now() }],
    assessment: {
      updatedAt: now(),
      goingWell: ['Mentor feedback loop exists.'],
      improve: ['No committed deep-work block this week.', 'Draft quality is uneven without artifact visuals.'],
      watchouts: ['Missed milestone could delay interviews by a month.']
    },
    chat: []
  }
];

export const seedPromptChips = [
  'Create a recovery plan for this week with concrete steps.',
  'What should I focus on in the next 48 hours?',
  'Draft a message to align stakeholders on this plan.'
];

export const seedFeedback: FeedbackEntry[] = [];
