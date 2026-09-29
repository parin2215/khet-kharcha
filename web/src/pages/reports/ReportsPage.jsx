import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useTransactionStore } from '../../store/useTransactionStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { Calendar, Sprout, FileDown, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { formatINR, formatDate } from '../../../../shared/utils/helpers.js';
import { FinancialEngine } from '../../../../shared/financial/FinancialEngine.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import ChartCard from '../../components/ChartCard.jsx';
import DataTable from '../../components/DataTable.jsx';
import OwnershipBadge from '../../components/OwnershipBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getCategoryById, EXPENSE_CATEGORIES } from '../../../../shared/constants/categories.js';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { 
    transactions, 
    fetchTransactions,
    loading 
  } = useTransactionStore();

  const [farmFilter, setFarmFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'own' | 'partner'
  const [dateRange, setDateRange] = useState('this-month'); // 'this-month' | 'last-month' | 'all'
  
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'bhagidari'
  const { partners, fetchPartners } = usePartnerStore();
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  useEffect(() => {
    if (profile?.uid) {
      fetchPartners(profile.uid);
    }
  }, [profile, fetchPartners]);

  // Set default partner
  useEffect(() => {
    if (partners.length > 0 && !selectedPartnerId) {
      setSelectedPartnerId(partners[0].id);
    }
  }, [partners, selectedPartnerId]);
  
  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
    }
  }, [profile, fetchFarms]);

  useEffect(() => {
    if (profile?.uid) {
      let startDate = null;
      let endDate = null;
      const now = new Date();

      if (dateRange === 'this-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (dateRange === 'last-month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      }

      const filters = {};
      if (farmFilter !== 'all') filters.farmId = farmFilter;
      if (typeFilter !== 'all') filters.expenseType = typeFilter;
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }

      fetchTransactions(profile.uid, filters);
    }
  }, [profile, farmFilter, typeFilter, dateRange, fetchTransactions]);

  const financials = FinancialEngine.calculate(transactions, {});
  const { totalExpenses, ownerShareExpense, partnerShareExpense } = financials;

  // Manual aggregations for pie charts
  const categoryMap = {};
  const farmMap = {};
  
  transactions.forEach(tx => {
    if (tx.type === 'expense' || tx.type === 'loan') {
      if (!categoryMap[tx.category]) categoryMap[tx.category] = { category: tx.category, total: 0 };
      categoryMap[tx.category].total += parseFloat(tx.amount) || 0;
      
      if (!farmMap[tx.farmId]) farmMap[tx.farmId] = { farmId: tx.farmId, total: 0 };
      farmMap[tx.farmId].total += parseFloat(tx.amount) || 0;
    }
  });

  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.total - a.total);
  const farmWiseTotals = Object.values(farmMap).sort((a, b) => b.total - a.total);

  // Export report to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Unicode font for Hindi/Indian signs if needed, standard PDF fallback works
    doc.setFontSize(20);
    doc.text("Khet Kharcha — Farming Expenses Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated for: ${profile?.name || 'Farmer'}`, 14, 23);
    doc.text(`Date Range: ${dateRange.toUpperCase()}`, 14, 28);
    
    // Summaries
    doc.text(`Total Expense: INR ${totalExpenses}`, 14, 38);
    doc.text(`Own Land Expense: INR ${ownerShareExpense}`, 14, 43);
    doc.text(`Partnership Expense: INR ${partnerShareExpense}`, 14, 48);

    const tableRows = transactions.map((exp) => {
      const farm = farms.find(f => f.id === exp.farmId);
      const cat = getCategoryById(exp.category);
      const categoryLabel = cat ? t(cat.nameKey) : exp.category;
      return [
        formatDate(exp.date),
        categoryLabel,
        farm?.name || 'Unknown',
        exp.expenseType === 'own' ? 'Own Share' : 'Partner Share',
        `Rs. ${exp.amount}`
      ];
    });

    doc.autoTable({
      startY: 55,
      head: [['Date', 'Category', 'Farm Plot', 'Type', 'Amount']],
      body: tableRows,
    });

    doc.save(`khet_kharcha_${dateRange}_report.pdf`);
  };

  // Categories Map
  const categoryChartData = categoryBreakdown.map((item) => {
    const category = getCategoryById(item.category);
    return {
      name: category?.nameKey ? t(category.nameKey) : item.category,
      amount: item.total,
      color: category?.color || '#1D9E75'
    };
  });

  // Share ratio data
  const shareChartData = [
    { name: 'My Share', value: ownerShareExpense, color: '#16a34a' },
    { name: 'Partner Share', value: partnerShareExpense, color: '#d97706' }
  ].filter(c => c.value > 0);

  // Farm-wise totals data
  const farmChartData = farmWiseTotals.map((item) => {
    const farm = farms.find(f => f.id === item.farmId);
    return {
      name: farm?.name || 'Unknown Plot',
      amount: item.total
    };
  });

  const columns = [
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      render: (row) => formatDate(row.date)
    },
    { 
      key: 'category', 
      label: 'Category', 
      sortable: true,
      render: (row) => {
        const cat = getCategoryById(row.category);
        return cat?.nameKey ? t(cat.nameKey) : row.category;
      }
    },
    { 
      key: 'farmId', 
      label: 'Farm',
      render: (row) => {
        const farm = farms.find(f => f.id === row.farmId);
        return farm?.name || 'N/A';
      }
    },
    { 
      key: 'expenseType', 
      label: 'Split Type',
      render: (row) => <OwnershipBadge type={row.expenseType} />
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (row) => <AmountDisplay amount={row.amount} className="font-extrabold text-stone-900" />
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t('navigation.reports')}</h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Perform detailed expense analytics and download physical ledger statements.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={transactions.length === 0}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl text-sm shadow transition duration-200 cursor-pointer"
        >
          <FileDown className="w-4.5 h-4.5" />
          Export ledger as PDF
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200/50">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-6 font-bold text-sm transition ${
            activeTab === 'analytics' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          {t('reports.title') || 'Ledger Analytics'}
        </button>
        <button
          onClick={() => setActiveTab('bhagidari')}
          className={`py-3 px-6 font-bold text-sm transition ${
            activeTab === 'bhagidari' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          {t('partnership.settlement') || 'Bhagidari (Partnership)'}
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Farm Select */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Select Farm Plot
              </label>
              <select
                value={farmFilter}
                onChange={(e) => setFarmFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none bg-white cursor-pointer"
              >
                <option value="all">All Farms</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Type Select */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Split Mode
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none bg-white cursor-pointer"
              >
                <option value="all">All Splits</option>
                <option value="own">Maro Kharcha (Own)</option>
                <option value="partner">Bhagidari (Partnership)</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Date Interval
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none bg-white cursor-pointer"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="all">All Records</option>
              </select>
            </div>

          </div>

      {/* Mini stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total ledger</span>
          <AmountDisplay amount={totalExpenses} className="text-xl md:text-2xl font-extrabold text-stone-900 block mt-1" />
        </div>
        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Own Costs</span>
          <AmountDisplay amount={ownerShareExpense} className="text-xl md:text-2xl font-extrabold text-ownExpense block mt-1" />
        </div>
        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Partner Splits</span>
          <AmountDisplay amount={partnerShareExpense} className="text-xl md:text-2xl font-extrabold text-partnerExpense block mt-1" />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Share */}
        <ChartCard title="Category Cost Breakdown">
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryChartData} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={10} tickFormatter={(v) => `₹${v}`} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} width={80} />
                <Tooltip formatter={(v) => formatINR(v)} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No cost details for charts." />
          )}
        </ChartCard>

        {/* Farm Plot breakdown */}
        <ChartCard title="Farm Wise Cost totals">
          {farmChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={farmChartData} margin={{ left: 10, right: 10 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                <YAxis stroke="#888888" fontSize={10} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => formatINR(v)} />
                <Bar dataKey="amount" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No cost details for charts." />
          )}
        </ChartCard>

      </div>

      {/* Expense ledger list */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-stone-900 px-1">Expense Ledger Statement</h3>
        <DataTable
          columns={columns}
          data={transactions.filter(t => t.type === 'expense')}
          emptyMessage="No ledger logs recorded for selected filter criteria."
        />
      </div>

        </div>
      )}

      {activeTab === 'bhagidari' && (
        <div className="space-y-6">
          
          {/* All Partners Summary Table */}
          <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">
              All Partners Summary View
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-stone-700">
                <thead className="bg-stone-50 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Partner</th>
                    <th className="p-3">Farm Plot</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Net Balance (₹)</th>
                    <th className="p-3">Crop Share Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {partners.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-stone-400">
                        No partners found.
                      </td>
                    </tr>
                  ) : (
                    partners.map((partner) => {
                      const farm = farms.find(f => f.id === partner.farmId);
                      const farmTransactions = transactions.filter(e => e.farmId === partner.farmId);
                      const latestHarvest = farm?.harvests?.length > 0 ? farm.harvests[farm.harvests.length - 1] : null;
                      
                      const financials = FinancialEngine.calculate(farmTransactions, { partnerProfitSharePercent: partner.partnerSharePercent });
                      // Note: FinancialEngine computes partnerSettlement which is the equivalent of netSettlement
                      // If partnerSettlement > 0, they get money. Wait! netSettlement in legacy was:
                      // positive means owner owes partner.
                      // FinancialEngine: ownerSettlement vs partnerSettlement.
                      // Let's use partnerSettlement.
                      const partnerGets = financials.partnerSettlement;
                      
                      return (
                        <tr key={partner.id} className="hover:bg-stone-50/50">
                          <td className="p-3">
                            <p className="text-stone-950 font-bold">{partner.name}</p>
                            <p className="text-[10px] text-stone-400">{partner.phone}</p>
                          </td>
                          <td className="p-3 text-stone-850">{farm?.name || 'N/A'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              partner.status === 'settled' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : latestHarvest 
                                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' 
                                  : 'bg-primary-light/40 text-primary border border-primary/10'
                            }`}>
                              {partner.status === 'settled' 
                                ? 'Settled' 
                                : latestHarvest 
                                  ? 'Harvest Pending' 
                                  : 'Active'}
                            </span>
                          </td>
                          <td className={`p-3 font-extrabold ${partnerGets > 0 ? 'text-emerald-600' : (partnerGets < 0 ? 'text-red-500' : 'text-stone-800')}`}>
                            {partnerGets > 0 ? `+₹${partnerGets.toLocaleString('en-IN')}` : (partnerGets < 0 ? `-₹${Math.abs(partnerGets).toLocaleString('en-IN')}` : '₹0')}
                          </td>
                          <td className="p-3 text-stone-850">
                            {latestHarvest 
                              ? `${Math.round(latestHarvest.totalYield * (partner.partnerSharePercent || 50) / 100)} ${latestHarvest.yieldUnit || 'q'}` 
                              : 'No harvest yet'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Partner Details */}
          {partners.length > 0 && (() => {
            const selectedPartner = partners.find(p => p.id === selectedPartnerId) || partners[0];
            const farm = farms.find(f => f.id === selectedPartner.farmId);
            const farmTransactions = transactions.filter(e => e.farmId === selectedPartner.farmId);
            const financials = FinancialEngine.calculate(farmTransactions, { partnerProfitSharePercent: selectedPartner.partnerSharePercent || 50 });
            
            const categoryMap = {};
            EXPENSE_CATEGORIES.forEach(cat => {
              categoryMap[cat.id] = { name: t(cat.nameKey), Owner: 0, Partner: 0 };
            });

            farmTransactions.forEach(exp => {
              const catObj = categoryMap[exp.category] || { name: exp.category, Owner: 0, Partner: 0 };
              const ownShare = exp.ownerShare !== undefined ? exp.ownerShare : (exp.expenseType === 'own' ? exp.amount : 0);
              const partnerShare = exp.partnerShare !== undefined ? exp.partnerShare : (exp.expenseType === 'partner' ? exp.amount : 0);
              
              catObj.Owner += ownShare;
              catObj.Partner += partnerShare;
              categoryMap[exp.category] = catObj;
            });

            const chartData = Object.values(categoryMap).filter(d => d.Owner > 0 || d.Partner > 0);

            return (
              <div className="space-y-6">
                
                {/* Select dropdown */}
                <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-stone-900">Per-Partner Detailed Analytics</h4>
                    <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Select a partner to drill down into seasonal costs, categories, and splits.</p>
                  </div>

                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="px-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none bg-white font-bold cursor-pointer"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({farms.find(f => f.id === p.farmId)?.name || 'Unknown Farm'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Splits Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm text-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Total farm cost</span>
                    <span className="text-base font-extrabold text-stone-855 block mt-1">₹{financials.totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm text-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Owner share</span>
                    <span className="text-base font-extrabold text-ownExpense block mt-1">₹{financials.ownerShareExpense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm text-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Partner share due</span>
                    <span className="text-base font-extrabold text-partnerExpense block mt-1">₹{financials.partnerShareExpense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm text-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Crop Share due</span>
                    <span className="text-base font-extrabold text-primary block mt-1">₹{financials.partnerIncomeShare.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Net Settlement Alert Bar */}
                <div className={`p-5 rounded-2xl border text-center shadow-sm ${
                  financials.partnerSettlement > 0 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : (financials.partnerSettlement < 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-stone-50 border-stone-200 text-stone-700')
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Net final balance</span>
                  <span className="text-2xl font-black block mt-1">
                    ₹{Math.abs(financials.partnerSettlement).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold block mt-1">
                    {financials.partnerSettlement > 0 
                      ? `Owner owes partner ₹${financials.partnerIncomeShare.toLocaleString('en-IN')} crop valuation (minus ₹${financials.partnerShareExpense.toLocaleString('en-IN')} expense share)` 
                      : (financials.partnerSettlement < 0 
                        ? `Partner owes owner ₹${Math.abs(financials.partnerSettlement).toLocaleString('en-IN')} outstanding expense share`
                        : 'All splits and payments are fully settled')}
                  </span>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Contribution Stacked Bar Chart */}
                  <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">Owner vs Partner Contribution</h4>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} margin={{ left: -10, right: 10 }}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={9} />
                          <YAxis stroke="#888888" fontSize={9} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip formatter={(v) => formatINR(v)} />
                          <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                          <Bar dataKey="Owner" name="Owner Share" fill="#16a34a" stackId="a" />
                          <Bar dataKey="Partner" name="Partner Share" fill="#d97706" stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState message="No cost details for category chart." />
                    )}
                  </div>

                  {/* Category Breakdown Table */}
                  <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">Category Wise Splitting Logs</h4>
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {chartData.length > 0 ? (
                        chartData.map((d, index) => (
                          <div key={index} className="p-3 bg-stone-50 border border-stone-150 rounded-xl flex justify-between items-center text-xs">
                            <span className="font-bold text-stone-850">{d.name}</span>
                            <div className="flex gap-4 font-bold text-[10px]">
                              <span className="text-ownExpense">Owner: ₹{d.Owner.toLocaleString('en-IN')}</span>
                              <span className="text-partnerExpense">Partner: ₹{d.Partner.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-stone-400 font-semibold">
                          No category split logs found.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })()}

        </div>
      )}

    </div>
  );
}
