/**
 * KhetKharcha - Financial Engine
 * Centralized calculation engine for all financial metrics.
 * 
 * Takes an array of Transactions and computes standardized outputs.
 */

export class FinancialEngine {
  /**
   * Calculate standard financials from an array of transactions
   * @param {Array} transactions 
   * @param {Object} options - { periodType, targetDate, partnerProfitSharePercent }
   */
  static calculate(transactions = [], options = {}) {
    const txs = Array.isArray(transactions) ? transactions : [];

    let totalExpenses = 0;
    let sharedExpenses = 0;
    
    // Loan tracking
    let ownerToPartnerLoans = 0;
    let partnerToOwnerLoans = 0;
    let ownerToPartnerRepayments = 0;
    let partnerToOwnerRepayments = 0;

    let investments = 0;
    let cropIncome = 0;
    
    // Share tracking
    let ownerShareExpense = 0;
    let partnerShareExpense = 0;
    
    let totalYield = 0;

    txs.forEach(tx => {
      const amt = parseFloat(tx?.amount) || 0;
      const oShare = parseFloat(tx?.ownerShare) || 0;
      const pShare = parseFloat(tx?.partnerShare) || 0;

      if (tx.type === 'expense') {
        totalExpenses += amt;
        sharedExpenses += amt;
        ownerShareExpense += oShare;
        partnerShareExpense += pShare;
      } 
      else if (tx.type === 'crop_sale') {
        cropIncome += amt;
        totalYield += parseFloat(tx.totalYield) || 0; 
      }
      else if (tx.type === 'loan') {
        if (tx.loanDirection === 'owner_to_partner') {
          ownerToPartnerLoans += amt;
        } else if (tx.loanDirection === 'partner_to_owner') {
          partnerToOwnerLoans += amt;
        }
      }
      else if (tx.type === 'repayment' || tx.type === 'settlement') {
        // We might log generic settlements here, which act as repayment from partner to owner
        if (tx.loanDirection === 'owner_to_partner') {
          ownerToPartnerRepayments += amt;
        } else if (tx.loanDirection === 'partner_to_owner') {
          partnerToOwnerRepayments += amt;
        } else {
          // If a general settlement is passed in, assume it's partner paying owner back.
          ownerToPartnerRepayments += amt;
        }
      }
      else if (tx.type === 'investment') {
        investments += amt;
      }
    });

    const netOwnerToPartnerLoan = ownerToPartnerLoans - ownerToPartnerRepayments;
    const netPartnerToOwnerLoan = partnerToOwnerLoans - partnerToOwnerRepayments;
    
    // Net loan balance from Partner's perspective
    const partnerNetLoanLiability = netOwnerToPartnerLoan - netPartnerToOwnerLoan;

    // Profit is solely Crop Income - Shared Expenses
    const grossProfit = cropIncome;
    const netProfit = cropIncome - sharedExpenses;

    const partnerProfitSharePercent = options.partnerProfitSharePercent !== undefined ? options.partnerProfitSharePercent : 50; 
    const ownerProfitSharePercent = 100 - partnerProfitSharePercent;

    const partnerIncomeShare = (cropIncome * partnerProfitSharePercent) / 100;
    const ownerIncomeShare = (cropIncome * ownerProfitSharePercent) / 100;

    // Partner Settlement
    const partnerNetProfit = partnerIncomeShare - partnerShareExpense;
    const partnerSettlement = partnerNetProfit - partnerNetLoanLiability;
    
    const ownerNetProfit = ownerIncomeShare - ownerShareExpense;
    const ownerSettlement = ownerNetProfit + partnerNetLoanLiability; 

    // KPIs
    const profitMargin = cropIncome > 0 ? ((netProfit / cropIncome) * 100).toFixed(1) : 0;
    const roi = sharedExpenses > 0 ? ((netProfit / sharedExpenses) * 100).toFixed(1) : 0;

    // Analytics
    const { trendData, monthlyAnalytics, yearlyAnalytics } = this.generateAnalytics(txs, options);

    return {
      totalExpenses: sharedExpenses, // Excludes loans
      sharedExpenses,
      
      lentMoney: {
        ownerToPartner: ownerToPartnerLoans,
        partnerToOwner: partnerToOwnerLoans,
        netPartnerLiability: partnerNetLoanLiability
      },
      
      investments,
      cropIncome,
      grossProfit,
      netProfit,
      
      ownerShareExpense,
      partnerShareExpense,
      
      ownerIncomeShare,
      partnerIncomeShare,
      
      ownerSettlement,
      partnerSettlement,
      
      roi: parseFloat(roi),
      profitMargin: parseFloat(profitMargin),
      yield: totalYield,
      
      trendData,
      monthlyAnalytics,
      yearlyAnalytics,
    };
  }

  static generateAnalytics(transactions, options) {
    const trendData = [];
    let monthlyAnalytics = [];
    let yearlyAnalytics = [];

    const periodType = options.periodType || 'year';
    const targetDate = options.targetDate ? new Date(options.targetDate) : new Date();

    if (periodType === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyExpenses = new Array(12).fill(0);
      const monthlyRevenue = new Array(12).fill(0);
      const monthlyYield = new Array(12).fill(0);

      transactions.forEach(tx => {
        const d = this.parseDate(tx.date || tx.createdAt);
        if (!d || isNaN(d.getTime())) return;
        
        if (d.getFullYear() === targetDate.getFullYear()) {
          const m = d.getMonth();
          if (tx.type === 'expense') monthlyExpenses[m] += parseFloat(tx.amount) || 0;
          if (tx.type === 'crop_sale') {
            monthlyRevenue[m] += parseFloat(tx.amount) || 0;
            monthlyYield[m] += parseFloat(tx.totalYield) || 0;
          }
        }
      });

      months.forEach((m, i) => {
        trendData.push({
          name: m,
          expense: monthlyExpenses[i],
          revenue: monthlyRevenue[i],
          profit: monthlyRevenue[i] - monthlyExpenses[i],
          yield: monthlyYield[i]
        });
      });
      monthlyAnalytics = trendData;
    } else {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      const weekExpenses = new Array(5).fill(0);
      const weekRevenue = new Array(5).fill(0);
      const weekYield = new Array(5).fill(0);

      transactions.forEach(tx => {
        const d = this.parseDate(tx.date || tx.createdAt);
        if (!d || isNaN(d.getTime())) return;

        if (d.getFullYear() === targetDate.getFullYear() && d.getMonth() === targetDate.getMonth()) {
          const dateNum = d.getDate();
          let weekIdx = Math.floor((dateNum - 1) / 7);
          if (weekIdx > 4) weekIdx = 4;

          if (tx.type === 'expense') weekExpenses[weekIdx] += parseFloat(tx.amount) || 0;
          if (tx.type === 'crop_sale') {
            weekRevenue[weekIdx] += parseFloat(tx.amount) || 0;
            weekYield[weekIdx] += parseFloat(tx.totalYield) || 0;
          }
        }
      });

      weeks.forEach((w, i) => {
        trendData.push({
          name: w,
          expense: weekExpenses[i],
          revenue: weekRevenue[i],
          profit: weekRevenue[i] - weekExpenses[i],
          yield: weekYield[i]
        });
      });
    }

    return { trendData, monthlyAnalytics, yearlyAnalytics };
  }

  static parseDate(d) {
    if (!d) return null;
    if (d.toDate) return d.toDate();
    if (d.seconds) return new Date(d.seconds * 1000);
    return new Date(d);
  }
}
