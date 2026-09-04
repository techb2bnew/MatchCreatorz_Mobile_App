import { createSupportTicketApi } from './supportService';

/**
 * Content moderation — reporting objectionable content and blocking abusive users.
 *
 * Required by App Store guideline 1.2. There is no dedicated moderation endpoint
 * on the backend yet, so both actions are filed as support tickets: that reaches
 * the admin team (who can hide content and block accounts from the admin panel)
 * and satisfies "blocking should also notify the developer of the inappropriate
 * content". Swap the two calls below for POST /reports and POST /users/:id/block
 * once those exist — nothing else in the app needs to change.
 */

export const REPORT_REASONS = [
  'Spam or scam',
  'Offensive or abusive language',
  'Sexual or explicit content',
  'Harassment or threats',
  'Fraud or fake profile',
  'Something else',
];

/** Human label for what is being reported, used in the ticket subject. */
const TYPE_LABELS = {
  job: 'Job post',
  service: 'Service',
  profile: 'User profile',
  message: 'Chat message',
  review: 'Review',
  bid: 'Bid / proposal',
};

export const reportContentApi = async (
  token,
  { type = 'content', id, title = '', reportedUser = '', reason, note = '' } = {},
) => {
  const label = TYPE_LABELS[type] || 'Content';
  const subject = `Report: ${label}${id ? ` #${id}` : ''}`;
  const body = [
    `Reported ${label.toLowerCase()}${id ? ` (ID: ${id})` : ''}.`,
    title ? `Title/preview: ${title}` : '',
    reportedUser ? `Reported user: ${reportedUser}` : '',
    `Reason: ${reason}`,
    note ? `Details: ${note}` : '',
    'Sent from the mobile app — please review within 24 hours.',
  ]
    .filter(Boolean)
    .join('\n');

  console.log('[Moderation] Report >>>', JSON.stringify({ subject, type, id, reason }));
  return createSupportTicketApi(token, { subject, body });
};

/** Blocking is enforced on-device; this ticket is what notifies the developer. */
export const notifyUserBlockedApi = async (token, { userId, userName = '', reason = '' } = {}) => {
  const subject = `Blocked user${userId ? ` #${userId}` : ''}`;
  const body = [
    `A user blocked ${userName || 'another user'}${userId ? ` (ID: ${userId})` : ''}.`,
    reason ? `Reason: ${reason}` : '',
    'Their content is hidden on the reporting device. Please review within 24 hours.',
  ]
    .filter(Boolean)
    .join('\n');

  console.log('[Moderation] Block >>>', JSON.stringify({ subject, userId }));
  return createSupportTicketApi(token, { subject, body });
};
