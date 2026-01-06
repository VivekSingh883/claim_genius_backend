export const PERMISSIONS = {
  // Ticket-related
  TICKET_CREATE: 'ticket:create',
  TICKET_VIEW: 'ticket:view',
  TICKET_UPDATE: 'ticket:update',
  TICKET_STATUS_CHANGE: 'ticket:status-change',
  TICKET_PRIORITY_CHANGE: 'ticket:priority-change',
  TICKET_REASSIGN: 'ticket:reassign',

  // Comment-related
  CHAT_CREATE: 'chat:create',
  CHAT_VIEW: 'chat:view',

  // Profile-related
  PROFILE_VIEW: 'profile:view',
  PROFILE_UPDATE: 'profile:update',

  //assignee-related
  ASSIGNEE_VIEW: 'assignee:view',
} as const;
