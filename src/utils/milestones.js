/**
 * Normalizes raw API milestone objects (from the booking detail response) into a
 * shape the UI uses. Field names + status values are parsed defensively because
 * the milestone schema is undocumented in swagger.
 *
 * Normalized status: 'not_submitted' | 'submitted' | 'paid' | 'rejected'
 *   - needsPay: buyer must pay/fund this stage (submitted but not yet held/paid)
 */

// Negative markers checked FIRST so "unpaid" / "incomplete" never match "paid".
const isNegativePay = s => /unpaid|not[_\s-]?paid|un[_\s-]?paid|incomplete|pending|fail|due|refund/.test(s);

// Money is settled/held for this stage (buyer's wallet already charged).
const isHeldOrPaid = s => Boolean(s) && !isNegativePay(s) && /held|escrow|charged|success|paid|released|captured/.test(s);

// Stage fully released to the seller (buyer accepted).
const isReleasedStatus = s => !isNegativePay(s) && /released|accepted|approved|completed|(^|[_\s])paid($|[_\s])/.test(s);

export const normalizeMilestone = (m, index = 0) => {
  const id = m?.id ?? m?.milestone_id ?? m?.milestoneId ?? m?._id ?? index;
  const title = m?.title ?? m?.name ?? `Milestone ${index + 1}`;
  const amount = Number(m?.amount ?? m?.price ?? m?.value ?? 0) || 0;

  const rawStatus = String(m?.status ?? m?.state ?? '').toLowerCase();
  const rawPay = String(m?.payment_status ?? m?.paymentStatus ?? '').toLowerCase();

  const notes = m?.notes ?? m?.note ?? m?.message ?? m?.delivery_note ?? m?.deliveryNote ?? '';
  const attachments = Array.isArray(m?.attachments)
    ? m.attachments
    : Array.isArray(m?.files)
    ? m.files
    : [];

  // Evidence the seller submitted this stage (used only when the status string
  // is ambiguous — never enough on its own to mark it paid).
  const hasSubmission = Boolean(
    m?.submitted_at ||
      m?.submittedAt ||
      m?.delivered_at ||
      m?.deliveredAt ||
      (typeof notes === 'string' && notes.trim().length) ||
      attachments.length,
  );

  let status;
  if (/reject|dispute|declin/.test(rawStatus)) status = 'rejected';
  else if (isReleasedStatus(rawStatus)) status = 'paid';
  else if (/submit|review|amidst|await|deliver|in_review/.test(rawStatus) || hasSubmission) {
    status = 'submitted';
  } else status = 'not_submitted';

  const paymentHeld = isHeldOrPaid(rawPay);
  const needsPay = status === 'submitted' && !paymentHeld;

  return { id, title, amount, status, paymentHeld, needsPay, notes, attachments, raw: m };
};

export const extractMilestones = detail => {
  const list = detail?.milestones ?? detail?.milestone ?? detail?.booking_milestones ?? [];
  return Array.isArray(list) ? list.map(normalizeMilestone) : [];
};

/**
 * Extracts the seller's whole-booking work submission (notes + attachments) from
 * a booking detail response. Field names are defensive (undocumented schema).
 * Returns null when there's no submission to show.
 */
export const extractSubmittedWork = detail => {
  if (!detail) return null;
  const sub = detail.submission || detail.work_submission || detail.delivery || detail.proof || {};
  const notes =
    detail.submission_notes ??
    detail.delivery_note ??
    detail.deliveryNote ??
    detail.work_notes ??
    sub.notes ??
    sub.note ??
    sub.message ??
    '';
  const rawAtt =
    detail.submission_attachments ??
    detail.proof_of_work ??
    detail.deliverables ??
    detail.work_attachments ??
    sub.attachments ??
    sub.files ??
    detail.attachments ?? // seller's proof-of-work is stored at booking-level `attachments`
    [];
  const attachments = Array.isArray(rawAtt) ? rawAtt : [];
  if (!String(notes || '').trim() && !attachments.length) return null;
  return { notes: String(notes || ''), attachments };
};
