/**
 * Hourly work entries (POST /seller/bookings/:id/work-entries).
 *
 * One entry per day the seller logs. The seller is NOT paid on submit — the
 * buyer must approve (or counter, which the seller then accepts) before any
 * money moves. Rate always comes from the contract, never from the client.
 *
 * Entry status: pending | countered | approved | disputed | rejected
 */

export const WORK_ENTRY_STATUS_META = {
  pending: { label: 'Under review', bg: '#E7EEFB', text: '#3B6981' },
  countered: { label: 'Countered', bg: '#FFF4E5', text: '#B26A00' },
  approved: { label: 'Paid', bg: '#E8F8EE', text: '#2BA84A' },
  disputed: { label: 'Disputed', bg: '#FDECEC', text: '#E23744' },
  rejected: { label: 'Rejected', bg: '#F3F4F6', text: '#8E8E93' },
};

const KNOWN_STATUSES = Object.keys(WORK_ENTRY_STATUS_META);

const num = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const normalizeWorkEntry = (entry, index = 0) => {
  const rawStatus = String(entry?.status ?? '').toLowerCase().trim();
  const status = KNOWN_STATUSES.includes(rawStatus) ? rawStatus : 'pending';
  const counterHours = entry?.counter_hours == null ? null : num(entry.counter_hours);

  return {
    id: entry?.id ?? index,
    workDate: entry?.work_date || '',
    description: entry?.description || '',
    hours: num(entry?.hours),
    rate: num(entry?.rate),
    amount: num(entry?.amount),
    platformFee: num(entry?.platform_fee),
    status,
    paymentStatus: String(entry?.payment_status ?? '').toLowerCase(),
    counterHours,
    counterBy: entry?.counter_by || null,
    counterNote: entry?.counter_note || '',
    disputeReason: entry?.dispute_reason || '',
    attachments: Array.isArray(entry?.attachments) ? entry.attachments : [],
    submittedAt: entry?.submitted_at || entry?.createdAt || '',
    raw: entry,
  };
};

export const extractWorkEntries = detail => {
  const list = detail?.workEntries ?? detail?.work_entries ?? [];
  return Array.isArray(list) ? list.map(normalizeWorkEntry) : [];
};

export const isHourlyBooking = detail =>
  String(detail?.job_type ?? detail?.jobType ?? '').toLowerCase() === 'hourly';

export const getBookingHourlyRate = detail => num(detail?.hourly_rate ?? detail?.hourlyRate);

export const getWeeklyHourLimit = detail => {
  const raw = detail?.weekly_hour_limit ?? detail?.weeklyHourLimit;
  if (raw == null || raw === '') return null;
  const value = num(raw);
  return value > 0 ? value : null;
};

/** Monday-based week key, so "hours used this week" matches a calendar week. */
const weekStartOf = date => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.getTime();
};

/**
 * Hours already logged in the same week as `forDate` (pending + countered +
 * approved all count against the limit — only rejected ones don't).
 * Indicative only: the server is the authority and returns a 400 if exceeded.
 */
export const hoursUsedInWeek = (entries = [], forDate = new Date()) => {
  const target = weekStartOf(forDate);
  if (target == null) return 0;
  return entries
    .filter(e => e.status !== 'rejected' && weekStartOf(e.workDate) === target)
    .reduce((sum, e) => sum + e.hours, 0);
};

/** Totals shown above the breakdown list. */
export const summarizeWorkEntries = (entries = []) => {
  const approved = entries.filter(e => e.status === 'approved');
  const awaiting = entries.filter(e => e.status === 'pending' || e.status === 'countered');
  return {
    approvedHours: approved.reduce((s, e) => s + e.hours, 0),
    approvedAmount: approved.reduce((s, e) => s + e.amount, 0),
    pendingHours: awaiting.reduce((s, e) => s + e.hours, 0),
    pendingAmount: awaiting.reduce((s, e) => s + e.amount, 0),
  };
};

export const formatWorkDate = value => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatHours = hours => {
  const n = num(hours);
  return `${Number.isInteger(n) ? n : n.toFixed(2)}h`;
};
