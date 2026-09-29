import { FinancialEngine } from '../FinancialEngine.js';

describe('FinancialEngine', () => {
  
  it('calculates pure expenses without loans', () => {
    const transactions = [
      { type: 'expense', amount: 100, ownerShare: 100, partnerShare: 0 },
      { type: 'expense', amount: 200, ownerShare: 100, partnerShare: 100 }
    ];
    
    const result = FinancialEngine.calculate(transactions, {});
    
    expect(result.totalExpenses).toBe(300);
    expect(result.sharedExpenses).toBe(300);
    expect(result.ownerShareExpense).toBe(200);
    expect(result.partnerShareExpense).toBe(100);
    expect(result.cropIncome).toBe(0);
    expect(result.netProfit).toBe(-300);
  });

  it('separates loans from expenses', () => {
    const transactions = [
      { type: 'expense', amount: 100, ownerShare: 100, partnerShare: 0 },
      { type: 'loan', amount: 50, loanDirection: 'owner_to_partner' },
      { type: 'loan', amount: 20, loanDirection: 'partner_to_owner' }
    ];

    const result = FinancialEngine.calculate(transactions, {});
    
    expect(result.totalExpenses).toBe(100);
    expect(result.lentMoney.ownerToPartner).toBe(50);
    expect(result.lentMoney.partnerToOwner).toBe(20);
    expect(result.lentMoney.netPartnerLiability).toBe(30);
  });

  it('handles crop sales and calculates profit correctly', () => {
    const transactions = [
      { type: 'expense', amount: 1000, ownerShare: 500, partnerShare: 500 },
      { type: 'crop_sale', amount: 3000, totalYield: 50 }
    ];

    const result = FinancialEngine.calculate(transactions, { partnerProfitSharePercent: 50 });
    
    expect(result.cropIncome).toBe(3000);
    expect(result.totalExpenses).toBe(1000);
    expect(result.grossProfit).toBe(3000);
    expect(result.netProfit).toBe(2000);
    expect(result.yield).toBe(50);
    
    expect(result.partnerIncomeShare).toBe(1500);
    expect(result.ownerIncomeShare).toBe(1500);
    
    // Partner gets 1500, but owes 500 in expenses. Settlement = 1000
    expect(result.partnerSettlement).toBe(1000);
    expect(result.ownerSettlement).toBe(1000);
  });

  it('incorporates loans into settlement', () => {
    const transactions = [
      { type: 'expense', amount: 1000, ownerShare: 500, partnerShare: 500 },
      { type: 'crop_sale', amount: 3000 },
      { type: 'loan', amount: 200, loanDirection: 'owner_to_partner' }
    ];

    const result = FinancialEngine.calculate(transactions, { partnerProfitSharePercent: 50 });
    
    // Partner Net Profit = 1000. 
    // Partner owes 200 to owner.
    // Partner Settlement = 1000 - 200 = 800
    // Owner Settlement = 1000 + 200 = 1200
    
    expect(result.partnerSettlement).toBe(800);
    expect(result.ownerSettlement).toBe(1200);
  });

  it('incorporates repayments into settlement', () => {
    const transactions = [
      { type: 'loan', amount: 500, loanDirection: 'owner_to_partner' },
      { type: 'repayment', amount: 200, loanDirection: 'owner_to_partner' } // partner repays 200
    ];

    const result = FinancialEngine.calculate(transactions, { partnerProfitSharePercent: 50 });
    
    // Partner owes 300
    // Settlement (no crop sale/expense) => Partner net profit = 0.
    // Settlement = 0 - 300 = -300
    expect(result.partnerSettlement).toBe(-300);
    expect(result.ownerSettlement).toBe(300);
  });

});
