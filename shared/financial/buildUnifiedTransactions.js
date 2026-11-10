import { FinancialEngine } from './FinancialEngine.js';

/**
 * Combines standalone transactions, live Current State ongoing crop entries,
 * and archived Farm Harvest History records into a single unified list
 * for dashboard KPIs, charts, and reports.
 * Strictly excludes Shop Bills (which are private vendor tracking).
 */
export const buildUnifiedTransactions = ({
  transactions = [],
  crops = [],
  farms = [],
  startDate = null,
  endDate = null,
  farmId = '',
  category = '',
  expenseType = 'all',
} = {}) => {
  const startMs = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
  const endMs = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
  const targetFarm = farmId && farmId !== 'all' ? farmId : '';
  const targetCat = category && category !== 'all' ? category : '';
  const targetType = expenseType && expenseType !== 'all' ? expenseType : '';

  const isWithinPeriod = (dateVal) => {
    if (!startMs && !endMs) return true;
    const d = FinancialEngine.parseDate(dateVal);
    if (!d || isNaN(d.getTime())) return false;
    const ms = d.getTime();
    if (startMs && ms < startMs) return false;
    if (endMs && ms > endMs) return false;
    return true;
  };

  // 1. Standalone transactions
  const list = (transactions || []).filter((tx) => {
    if (targetFarm && tx.farmId !== targetFarm) return false;
    if (targetCat && tx.category !== targetCat) return false;
    if (targetType && tx.expenseType !== targetType) return false;
    if (!isWithinPeriod(tx.date || tx.createdAt)) return false;
    return true;
  });

  // 2. Live Ongoing Crops (Current State)
  (crops || []).forEach((c) => {
    if (c.status !== 'ongoing') return;
    if (targetFarm && c.farmId !== targetFarm) return;

    const hasPartner = !!(c.partner?.hasPartner);
    const itemExpenseType = hasPartner ? 'partner' : 'own';
    if (targetType && itemExpenseType !== targetType) return;

    const partnerPct = hasPartner ? (parseFloat(c.partner.sharePercent) || 50) : 0;
    const ownerPct = 100 - partnerPct;

    (c.expenses || []).forEach((exp) => {
      const cat = exp.category || 'other';
      if (targetCat && cat !== targetCat) return;
      const d = exp.date || c.sowingDate || c.createdAt;
      if (!isWithinPeriod(d)) return;

      const amt = parseFloat(exp.amount) || 0;
      const ownerShare = hasPartner ? Math.round((amt * ownerPct) / 100) : amt;
      const partnerShare = hasPartner ? amt - ownerShare : 0;

      list.push({
        id: `cc_exp_${c.id}_${exp.id}`,
        farmId: c.farmId || '',
        farmName: c.farmName || '',
        cropName: c.cropName,
        type: 'expense',
        expenseType: itemExpenseType,
        category: cat,
        amount: amt,
        ownerShare,
        partnerShare,
        paidBy: exp.paidBy || 'owner',
        date: d,
        notes: exp.notes ? `${c.cropName} • ${exp.notes}` : `${c.cropName} (${c.farmName || 'Ongoing'})`,
        source: 'current_crop',
      });
    });

    (c.sales || []).forEach((s) => {
      if (targetCat) return;
      const d = s.date || c.createdAt;
      if (!isWithinPeriod(d)) return;

      list.push({
        id: `cc_sale_${c.id}_${s.id}`,
        farmId: c.farmId || '',
        farmName: c.farmName || '',
        cropName: c.cropName,
        type: 'crop_sale',
        expenseType: itemExpenseType,
        category: 'crop_sale',
        amount: parseFloat(s.totalMadatar) || 0,
        totalYield: parseFloat(s.weightInMann) || 0,
        yieldUnit: 'mann',
        date: d,
        notes: `${c.cropName} Sale`,
        source: 'current_crop',
      });
    });
  });

  // 3. Archived Farm Harvest History (farms[].cropHistory)
  (farms || []).forEach((f) => {
    if (targetFarm && f.id !== targetFarm) return;

    (f.cropHistory || []).forEach((h) => {
      const refDate = h.harvestDate || (h.year ? `${h.year}-06-15` : null);
      if (!isWithinPeriod(refDate)) return;

      const hasPartner = !!(h.partner && h.partner.name);
      const itemExpenseType = hasPartner ? 'partner' : 'own';
      if (targetType && itemExpenseType !== targetType) return;

      const partnerPct = hasPartner ? (parseFloat(h.partner.sharePercent) || 50) : 0;
      const ownerPct = 100 - partnerPct;

      const expMap = h.expensesByCategory && typeof h.expensesByCategory === 'object' ? h.expensesByCategory : null;
      const expEntries = expMap ? Object.entries(expMap).filter(([, v]) => (parseFloat(v) || 0) > 0) : [];

      if (expEntries.length > 0) {
        expEntries.forEach(([catKey, catAmt]) => {
          if (targetCat && catKey !== targetCat) return;
          const amt = parseFloat(catAmt) || 0;
          const ownerShare = hasPartner ? Math.round((amt * ownerPct) / 100) : amt;
          const partnerShare = hasPartner ? amt - ownerShare : 0;

          list.push({
            id: `hist_exp_${f.id}_${h.id}_${catKey}`,
            farmId: f.id,
            farmName: f.name,
            cropName: h.cropName,
            type: 'expense',
            expenseType: itemExpenseType,
            category: catKey,
            amount: amt,
            ownerShare,
            partnerShare,
            date: refDate,
            notes: `${h.cropName} (${f.name})`,
            source: 'farm_history',
          });
        });
      } else if ((parseFloat(h.totalExpenses) || 0) > 0) {
        if (!targetCat || targetCat === 'other') {
          const amt = parseFloat(h.totalExpenses) || 0;
          const ownerShare = hasPartner ? Math.round((amt * ownerPct) / 100) : amt;
          const partnerShare = hasPartner ? amt - ownerShare : 0;

          list.push({
            id: `hist_exp_${f.id}_${h.id}_total`,
            farmId: f.id,
            farmName: f.name,
            cropName: h.cropName,
            type: 'expense',
            expenseType: itemExpenseType,
            category: 'other',
            amount: amt,
            ownerShare,
            partnerShare,
            date: refDate,
            notes: `${h.cropName} (${f.name})`,
            source: 'farm_history',
          });
        }
      }

      const rev = parseFloat(h.totalRevenue) || 0;
      const yAmt = parseFloat(h.yieldAmount) || 0;
      if (!targetCat && (rev > 0 || yAmt > 0)) {
        list.push({
          id: `hist_rev_${f.id}_${h.id}`,
          farmId: f.id,
          farmName: f.name,
          cropName: h.cropName,
          type: 'crop_sale',
          expenseType: itemExpenseType,
          category: 'crop_sale',
          amount: rev,
          totalYield: yAmt,
          yieldUnit: h.yieldUnit || 'quintal',
          date: refDate,
          notes: `${h.cropName} Harvest (${f.name})`,
          source: 'farm_history',
        });
      }
    });
  });

  return list.sort((a, b) => {
    const da = FinancialEngine.parseDate(a.date || a.createdAt)?.getTime() || 0;
    const db = FinancialEngine.parseDate(b.date || b.createdAt)?.getTime() || 0;
    return db - da;
  });
};

