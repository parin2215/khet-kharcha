import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useTransactionStore } from '../../store/useTransactionStore.js';
import { useBillStore } from '../../store/useBillStore.js';
import { useReminderStore } from '../../store/useReminderStore.js';
import { 
  Sprout, 
  ArrowRight, 
  TrendingUp, 
  Plus, 
  AlertTriangle,
  Receipt,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ComposedChart, Legend, Area } from 'recharts';
import { formatINR, formatDate } from '../../../../shared/utils/helpers.js';

import { FinancialEngine } from '../../../../shared/financial/FinancialEngine.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import MonthSelector from '../../components/MonthSelector.jsx';
import ChartCard from '../../components/ChartCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';
import { getCategoryColor, getCategoryById, EXPENSE_CATEGORIES } from '../../../../shared/constants/categories.js';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { 
    transactions, 
    fetchTransactions, 
    loading 
  } = useTransactionStore();
  const { pendingCount, fetchPendingSummary } = useBillStore();
  const { upcoming, fetchUpcoming, toggleReminder } = useReminderStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('month'); // 'month' | 'year'
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
      fetchPendingSummary(profile.uid);
    }
  }, [profile, fetchFarms, fetchPendingSummary]);

  useEffect(() => {
    if (profile?.uid) {
      const year = selectedDate.getFullYear();
      let startDate, endDate;
      
      if (periodType === 'month') {
        const month = selectedDate.getMonth();
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0, 23, 59, 59);
      } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59);
      }

      const filters = { startDate, endDate };
      if (selectedFarmId) filters.farmId = selectedFarmId;
      if (selectedCategory) filters.category = selectedCategory;

      fetchTransactions(profile.uid, filters);
      fetchUpcoming(profile.uid, 3);
    }
  }, [profile, selectedDate, periodType, selectedFarmId, selectedCategory, fetchTransactions, fetchUpcoming]);

  // Use FinancialEngine to calculate everything
  const financials = FinancialEngine.calculate(transactions, {
    periodType,
    targetDate: selectedDate
  });

  const {
    totalExpenses: totalInvestment,
    cropIncome: totalIncome,
    netProfit,
    profitMargin,
    roi,
    trendData,
    sharedExpenses
  } = financials;
  
  // Need to compute category breakdown manually for the pie chart, or add it to FinancialEngine.
  // Actually, FinancialEngine should probably just return it or we do a quick reduce here:
  const categoryMap = {};
  transactions.forEach(tx => {
    if (tx.type === 'expense' || tx.type === 'loan') {
      if (!categoryMap[tx.category]) {
        categoryMap[tx.category] = { category: tx.category, total: 0 };
      }
      categoryMap[tx.category].total += parseFloat(tx.amount) || 0;
    }
  });
  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.total - a.total);

  // Map Category Breakdown for Recharts
  const chartData = categoryBreakdown.map((item) => {
    const category = getCategoryById(item.category);
    return {
      name: category?.nameKey ? t(category.nameKey) : item.category,
      amount: item.total,
      color: category?.color || '#1D9E75'
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-primary/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Jai Kisan, {profile?.name || 'Farmer'}! 🌾
          </h1>
          <p className="text-sm text-emerald-100 font-medium mt-1.5 max-w-md">
            Welcome back to your farming logs. Let's see how your farms are doing this month.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/expenses/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-primary hover:bg-stone-50 font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition duration-200"
          >
            <Plus className="w-4.5 h-4.5" />
            {t('navigation.addExpense')}
          </Link>
          <Link 
            to="/farms/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-dark/40 border border-emerald-400/30 text-white hover:bg-primary-dark/60 font-bold rounded-xl text-sm transition duration-200"
          >
            <Sprout className="w-4.5 h-4.5" />
            Add Farm
          </Link>
        </div>
      </div>

      {/* Date selector and mini filter */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-stone-200/50 p-4 rounded-2xl shadow-sm">
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-stone-500 font-bold text-xs">
            <Calendar className="w-4 h-4 text-primary" />
            Filter Period:
          </div>
          <select 
            value={periodType} 
            onChange={(e) => setPeriodType(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200/50 rounded-xl text-xs font-bold text-stone-700 shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          {/* Farm Filter */}
          <select 
            value={selectedFarmId} 
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200/50 rounded-xl text-xs font-bold text-stone-700 shadow-sm focus:outline-none cursor-pointer max-w-[150px] truncate"
          >
            <option value="">All Farms</option>
            {farms.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200/50 rounded-xl text-xs font-bold text-stone-700 shadow-sm focus:outline-none cursor-pointer max-w-[150px] truncate"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{t(cat.nameKey) || cat.id}</option>
            ))}
          </select>
        </div>

        <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} mode={periodType} />
      </div>

      {/* 2x2 Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total expense */}
        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            {t('expense.total') || 'Total Expense'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <AmountDisplay amount={financials.totalExpenses} className="text-2xl font-extrabold text-stone-900" />
            <span className="text-[10px] font-bold text-red-500 flex items-center bg-red-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              12%
            </span>
          </div>
        </div>

        {/* Card 2: Own expenses */}
        <div className="bg-ownExpenseLight/30 border border-ownExpense/10 rounded-2xl p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
          <span className="text-[11px] font-bold text-ownExpense uppercase tracking-wider block">
            {t('expense.own') || 'Maro Kharcha'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <AmountDisplay amount={financials.ownerShareExpense} className="text-2xl font-extrabold text-ownExpense" />
            <span className="text-xs font-semibold text-ownExpense/70">Own Land</span>
          </div>
        </div>

        {/* Card 3: Partner expenses */}
        <div className="bg-partnerExpenseLight/30 border border-partnerExpense/10 rounded-2xl p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
          <span className="text-[11px] font-bold text-partnerExpense uppercase tracking-wider block">
            {t('expense.partner') || 'Bhagidari'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <AmountDisplay amount={financials.partnerShareExpense} className="text-2xl font-extrabold text-partnerExpense" />
            <span className="text-xs font-semibold text-partnerExpense/70">Share Share</span>
          </div>
        </div>

        {/* Card 4: Pending bills */}
        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            {t('navigation.bills') || 'Pending Bills'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-stone-900">
              {pendingCount.count} <span className="text-xs text-stone-400 font-semibold">unpaid</span>
            </span>
            <AmountDisplay amount={pendingCount.total} className="text-base font-bold text-red-500" />
          </div>
        </div>

      </div>

      {/* Business Growth & Analytics KPIs */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Business Growth Analytics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
            <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Total Investment</span>
            <AmountDisplay amount={totalInvestment} className="text-lg font-extrabold text-stone-700" />
          </div>

          <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
            <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Total Income</span>
            <AmountDisplay amount={totalIncome} className="text-lg font-extrabold text-stone-700" />
          </div>

          

          <div className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition ${netProfit >= 0 ? 'border-emerald-200/50' : 'border-red-200/50'}`}>
            <span className={`text-[10px] font-bold uppercase block mb-1 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>Net Profit / Loss</span>
            <AmountDisplay amount={Math.abs(netProfit)} className={`text-lg font-extrabold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} prefix={netProfit < 0 ? '-' : '+'} />
          </div>

          <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
            <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Profit Margin</span>
            <span className={`text-lg font-extrabold ${profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {profitMargin}%
            </span>
          </div>

          <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
            <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">ROI</span>
            <span className={`text-lg font-extrabold ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {roi}%
            </span>
          </div>

        </div>
      </div>

      {/* Main Charts & Activity sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Category breakdown */}
          <ChartCard 
            title="Expenses by Category" 
            subtitle="Which operations cost the most this month"
          >
            {loading ? (
              <LoadingSkeleton width="w-full" height="h-64" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" stroke="#888888" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} width={80} />
                  <Tooltip formatter={(value) => formatINR(value)} cursor={{ fill: '#f5f5f4' }} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No expenses recorded for this month." />
            )}
          </ChartCard>

          {/* Profit & Loss Trend */}
          <ChartCard 
            title="Profit & Loss Trend" 
            subtitle="Comparing revenue and expenses over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => formatINR(value)} cursor={{ fill: '#f5f5f4' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="revenue" name="Total Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Total Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Yield Progress */}
          <ChartCard 
            title="Yield Progress" 
            subtitle="Crop production volume over time"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip cursor={{ fill: '#f5f5f4' }} formatter={(val) => `${val} units`} />
                <Bar dataKey="yield" name="Yield Volume" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        {/* Right Column (Activities) */}
        <div className="space-y-6">
          
          {/* Recent Expenses Card */}
          <div className="bg-white border border-stone-200/50 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base text-stone-900">Recent Expenses</h3>
              <Link 
                to="/reports" 
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <LoadingSkeleton height="h-14" />
                <LoadingSkeleton height="h-14" />
                <LoadingSkeleton height="h-14" />
              </div>
            ) : transactions.filter(t => t.type === 'expense').length > 0 ? (
              <div className="space-y-3">
                {transactions.filter(t => t.type === 'expense').slice(0, 5).map((exp) => {
                  const cat = getCategoryById(exp.category);
                  const color = cat?.color || '#6B7280';
                  
                  return (
                    <div 
                      key={exp.id}
                      className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-100 rounded-xl transition cursor-pointer"
                      onClick={() => navigate(`/farms/${exp.farmId}`)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] shrink-0"
                          style={{ backgroundColor: color + '15', color }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.75-2.56a1.5 1.5 0 0 0 0-.834l-.75-2.56H15a1.5 1.5 0 0 1 1.5 1.5v.76a1.5 1.5 0 0 1-1.5 1.5H9z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {cat?.nameKey ? t(cat.nameKey) : exp.category}
                          </p>
                          <p className="text-[10px] text-stone-400 font-semibold truncate">
                            {formatDate(exp.date)}
                          </p>
                        </div>
                      </div>
                      <AmountDisplay amount={exp.amount} className="text-xs font-extrabold text-stone-900 ml-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-400 font-semibold">
                No recent expenses recorded.
              </div>
            )}
          </div>

          {/* Upcoming Reminders Card */}
          <div className="bg-white border border-stone-200/50 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base text-stone-900">Upcoming Activities</h3>
              <Link 
                to="/reminders" 
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                Manage
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((rem) => (
                  <div 
                    key={rem.id}
                    className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-100 rounded-xl"
                  >
                    <button
                      onClick={() => toggleReminder(rem.id, true)}
                      className="p-1 border border-stone-200 hover:border-primary rounded-md bg-white text-stone-300 hover:text-primary transition shrink-0 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">{rem.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-semibold mt-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Due {formatDate(rem.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-400 font-semibold">
                No upcoming reminders.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

// Simple Helper to cell rendering
function Cell({ fill, children }) {
  return React.cloneElement(children, { fill });
}
