/**
 * Khet Kharcha — Partner Khata (running statement)
 *
 * Builds a chronological, auditable statement of what a batai partner and the
 * owner owe each other on a single farm. Everything is derived from the existing
 * transaction model, so no new writes are required.
 *
 * Sign convention: a positive `amount` on a credit line means the partner owes
 * the owner (partner is in debt); a negative means the owner owes the partner.
 */

const toMs = (value) => {
  if (!value) return 0;
  if (typeof value === 'object') {
    if (value.seconds !== undefined) return value.seconds * 1000;
    if (typeof value.toDate === 'function') return value.toDate().getTime();
  }
  const t = new Date(value).getTime();
  return isNaN(t) ? 0 : t;
};

const round2 = (n) => Math.round((n || 0) * 100) / 100;

/**
 * Build a partner's running statement for a farm.
 * @param {Object} params
 * @param {Array}  params.transactions - farm transactions (expense/loan/repayment/settlement/crop_sale)
 * @param {Object} params.partner - { id, name, sharePercent, totalPaid, terms }
 * @param {string} [params.partnerId] - filter to a single partner
 * @param {string} [params.crop] - crop name for valuing delivered produce
 * @returns {Object} statement
 */
export const buildPartnerStatement = ({ transactions = [], partner, partnerId = null, crop = '' } = {}) => {
  const list = Array.isArray(transactions) ? transactions : [];
  const sharePercent =
    parseFloat(partner?.terms?.cropSharePercent) || parseFloat(partner?.sharePercent) || 50;
  const share = sharePercent / 100;

  const lines = [];
  let balance = 0; // positive = partner owes owner

  // Opening credit: whatever the partner already paid/settled before this period.
  const openingPaid = round2(parseFloat(partner?.totalPaid) || 0);
  if (openingPaid !== 0) {
    balance -= openingPaid;
    lines.push({
      date: null,
      type: 'opening',
      description: 'Opening credit (previous settlements)',
      amount: round2(-openingPaid),
      balance,
    });
  }

  for (const tx of list) {
    if (partnerId && tx.partnerId && tx.partnerId !== partnerId) continue;

    const amount = parseFloat(tx.amount) || 0;
    if (!amount) continue;
    const date = toMs(tx.date || tx.createdAt);

    if (tx.type === 'expense') {
      // Only the partner's share of a shared cost becomes their liability.
      const partnerShare =
        tx.partnerShare !== undefined
          ? parseFloat(tx.partnerShare) || 0
          : tx.expenseType === 'partner'
            ? amount
            : amount * share;
      if (!partnerShare) continue;
      balance += partnerShare;
      lines.push({
        date,
        type: 'expense',
        description: tx.notes || tx.note || 'Expense share',
        amount: round2(partnerShare),
        balance: round2(balance),
      });
    } else if (tx.type === 'loan') {
      // Owner advanced cash to the partner.
      const direction = tx.loanDirection || 'owner_to_partner';
      const delta = direction === 'owner_to_partner' ? amount : -amount;
      balance += delta;
      lines.push({
        date,
        type: 'loan',
        description: direction === 'owner_to_partner' ? 'Cash advance to partner' : 'Cash advance from partner',
        amount: round2(delta),
        balance: round2(balance),
      });
    } else if (tx.type === 'repayment' || tx.type === 'settlement') {
      const direction = tx.loanDirection || 'owner_to_partner';
      const delta = direction === 'owner_to_partner' ? -amount : amount;
      balance += delta;
      lines.push({
        date,
        type: 'repayment',
        description: tx.notes || tx.note || 'Repayment',
        amount: round2(delta),
        balance: round2(balance),
      });
    } else if (tx.type === 'crop_sale') {
      // Value of produce delivered to the partner against their share.
      const value = amount * share;
      balance -= value;
      lines.push({
        date,
        type: 'crop',
        description: crop ? `Crop sale (${crop})` : 'Crop sale credit',
        amount: round2(-value),
        balance: round2(balance),
      });
    }
  }

  lines.sort((a, b) => (a.date || 0) - (b.date || 0));

  // Running balances must be recomputed in chronological order after sorting.
  let running = 0;
  for (const line of lines) {
    running = round2(running + line.amount);
    line.balance = running;
  }

  const credits = lines.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0);
  const debits = lines.filter((l) => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);

  return {
    partnerId: partner?.id ?? partnerId,
    partnerName: partner?.name || '',
    sharePercent,
    lines,
    totalCredits: round2(credits),
    totalDebits: round2(debits),
    balance: round2(running),
    // Positive => partner owes the owner; negative => owner owes the partner.
    direction: running > 0 ? 'partner_owes_owner' : running < 0 ? 'owner_owes_partner' : 'settled',
  };
};

/**
 * Render a partner statement as plain text (for WhatsApp sharing / printing).
 * @param {Object} statement - result of buildPartnerStatement
 * @param {Object} [options]
 * @param {string} [options.farmName]
 * @param {string} [options.lang]
 * @returns {string}
 */
export const formatStatement = (statement, options = {}) => {
  const farmName = options.farmName || 'Farm';
  const lines = statement?.lines || [];
  const fmt = (n) => `₹${Math.round(Math.abs(n)).toLocaleString('en-IN')}`;
  const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString('en-IN') : '—');

  const rows = lines.map(
    (l) => `  ${fmtDate(l.date).padEnd(11)} ${(l.description || '').slice(0, 30).padEnd(32)} ${l.amount >= 0 ? '+' : '-'}${fmt(l.amount).padStart(10)}  bal ${fmt(l.balance).padStart(10)}`
  );

  const summary =
    statement.balance > 0
      ? `Partner owes Owner: ${fmt(statement.balance)}`
      : statement.balance < 0
        ? `Owner owes Partner: ${fmt(statement.balance)}`
        : 'Fully settled';

  return [
    'KHET KHARCHA - PARTNER KHATA',
    `Farm: ${farmName}`,
    `Share: ${statement.sharePercent}%`,
    '',
    ...(rows.length ? rows : ['  (no transactions)']),
    '',
    `Total credits: ${fmt(statement.totalCredits)}`,
    `Total debits:  ${fmt(statement.totalDebits)}`,
    `BALANCE: ${summary}`,
  ].join('\n');
};

export default buildPartnerStatement;