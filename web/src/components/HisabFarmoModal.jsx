import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Receipt, 
  TrendingUp, 
  Coins, 
  Scale, 
  Users, 
  Sprout, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { formatINR, formatDate } from '../../../shared/utils/helpers.js';
import { calculateFarmoHisab } from '../store/useCurrentCropStore.js';

/**
 * Exact visual replica of the 2-page Gujarati accounting ledger:
 * "હિસાબ કરવાનો ફરમો" (Hisab Karvano Farmo)
 */
export default function HisabFarmoModal({ crop, onClose, onRefresh }) {
  if (!crop) return null;

  const [activeTab, setActiveTab] = useState('farmo'); // 'farmo' | 'expenses' | 'upad' | 'sales'

  // If crop has pre-calculated farmoDetails (history record), use that or calculate live
  const hisab = crop.farmoDetails || calculateFarmoHisab(crop);
  const hasPartner = !!(crop.partner?.hasPartner || crop.partner?.name);
  const partnerName = crop.partner?.name || 'પાર્ટનર (ભાગીદાર)';
  const partnerShare = crop.partner?.sharePercent || 50;

  // Average rate per mann if multiple sales
  const avgRatePerMann = hisab.totalWeightInMann > 0 
    ? Math.round(hisab.totalMadatar / hisab.totalWeightInMann) 
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:fixed">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 bg-stone-50 print:hidden sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight font-serif">
                હિસાબ કરવાનો ફરમો
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {crop.cropName} • {crop.farmName} {crop.season ? `(${crop.season.toUpperCase()})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
              title="Print Farmo Ledger"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>પ્રિન્ટ / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Hidden in Print) */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-100/50 print:hidden overflow-x-auto">
          <button
            onClick={() => setActiveTab('farmo')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'farmo'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            📄 સંપૂર્ણ ફરમો (Full Ledger Sheet)
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'expenses'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ખર્ચ વિગત ({(crop.expenses || []).length})
          </button>
          <button
            onClick={() => setActiveTab('upad')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'upad'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ઉપાડ વિગત ({(crop.upad || []).length})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'sales'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            વજન અને વેચાણ ({(crop.sales || []).length})
          </button>
        </div>

        {/* Modal Main Content Body */}
        <div className="p-4 sm:p-8 space-y-8 bg-white print:p-4 text-stone-900 font-sans">

          {/* ======================================================== */}
          {/* TAB 1: COMPLETE 2-PAGE FARMO DOCUMENT                    */}
          {/* ======================================================== */}
          {activeTab === 'farmo' && (
            <div className="space-y-10 max-w-3xl mx-auto">
              
              {/* PAGE 1 CONTAINER */}
              <div className="border-2 border-stone-800 rounded-2xl p-6 sm:p-8 bg-white shadow-sm print:border-stone-900 print:shadow-none space-y-6">
                
                {/* Header */}
                <div className="text-center pb-4 border-b-2 border-stone-800">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-stone-950 font-serif">
                    હિસાબ કરવાનો ફરમો
                  </h1>
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-2 text-xs font-semibold text-stone-600">
                    <span>ખેતર: <strong className="text-stone-900">{crop.farmName}</strong></span>
                    <span>પાક: <strong className="text-stone-900">{crop.cropName} {crop.variety ? `(${crop.variety})` : ''}</strong></span>
                    <span>સીઝન: <strong className="text-stone-900">{crop.season}</strong></span>
                    {hasPartner && (
                      <span>ભાગીદાર: <strong className="text-stone-900">{partnerName} ({partnerShare}%)</strong></span>
                    )}
                  </div>
                </div>

                {/* 1. TOP DUAL BOX: ખર્ચ VS ઉપાડ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 border-2 border-stone-800 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-stone-800 rounded-xl overflow-hidden">
                  
                  {/* Left Box: ખર્ચ */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-stone-50/40">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-stone-950">
                        ખર્ચ :
                      </h3>
                      <p className="text-xs text-stone-700 leading-relaxed mt-1">
                        આમાં કુલ ખર્ચો આવશે જે મારા અને મારા પાર્ટનર ના ભાગ માં આવશે {partnerShare === 50 ? 'અડધા' : `${partnerShare}%`}.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-300 space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span>કુલ ખર્ચ રકમ :</span>
                        <span className="text-base font-extrabold text-stone-950">
                          {formatINR(hisab.totalKharch)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
                        <span>ભાગે :</span>
                        <span className="font-bold text-stone-900">
                          {hasPartner ? formatINR(hisab.kharchBhagePartner) : 'NA (100% Owner)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Box: ઉપાડ */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-stone-50/40">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-stone-950">
                        ઉપાડ :
                      </h3>
                      <p className="text-xs text-stone-700 leading-relaxed mt-1">
                        આમાં પાર્ટનર જે પૈસા લેશે મારી જોડે થી એ અને એના ભાગ માં આવતો ખર્ચ આવશે.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-300 space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span>કુલ ઉપાડ રકમ :</span>
                        <span className="text-base font-extrabold text-amber-700">
                          {formatINR(hisab.totalUpad)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-stone-500">
                        <span>ભાગે :</span>
                        <span className="font-bold text-stone-600">NA</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. WEIGHMENT & HARVEST SALES TABLE */}
                <div className="border-2 border-stone-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y-2 divide-stone-800 font-medium">
                      
                      {/* Row 1: ગ્રોસસ વજન */}
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          ગ્રોસસ વજન
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">ખેતર માં નિકડેલ કુલ વજન</span>
                          <span className="font-extrabold text-stone-900 text-sm">
                            {hisab.totalGrossWeightKg} કિલો (kg)
                          </span>
                        </td>
                      </tr>

                      {/* Row 2: અન્ય વજન */}
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          અન્ય વજન (કોઈપણ)
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">બીજું કોઈ વજન જેમ કે તમાકુ ખેતી માટે રગો, ગરિયા વગેરે નું વજન</span>
                          <span className="font-extrabold text-stone-900 text-sm">
                            {hisab.totalOtherWeightKg} કિલો (kg)
                          </span>
                        </td>
                      </tr>

                      {/* Row 3: વજન કપાત */}
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          વજન કપાત (કોઈપણ)
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">કપતું વજન જેમ કે બારદાન, વટાવ વગેરે</span>
                          <span className="font-extrabold text-red-700 text-sm">
                            - {hisab.totalWeightDeductionKg} કિલો (kg)
                          </span>
                        </td>
                      </tr>

                      {/* Row 4: નેટ વજન */}
                      <tr className="hover:bg-stone-50/60 bg-stone-50/40">
                        <td className="p-3 sm:p-3.5 font-extrabold text-stone-950 w-1/3 border-r-2 border-stone-800 bg-stone-200/40">
                          નેટ વજન
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-700 font-semibold">ગ્રોસસ વજન માં બીજા વજનો નો ઉમેરો કે કપાત કર્યા પછી નું વજન</span>
                          <span className="font-extrabold text-emerald-800 text-base">
                            {hisab.totalNetWeightKg} કિલો (kg)
                          </span>
                        </td>
                      </tr>

                      {/* Row 5: પાક વેચાણ ભાવ */}
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          પાક વેચાણ ભાવ
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">જે ભાવે પાક વેચવામાં આવ્યો હોય તે (પ્રતિ મણ)</span>
                          <span className="font-extrabold text-stone-900 text-sm">
                            ₹{avgRatePerMann} / મણ
                          </span>
                        </td>
                      </tr>

                      {/* Row 6: વજન મણ માં */}
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          વજન મણ માં
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">નેટ વજન કિલો માં હોય તો તેને મણ માં કરવાનું <strong>“નેટ વજન / ૨૦”</strong></span>
                          <span className="font-extrabold text-indigo-900 text-base">
                            {hisab.totalWeightInMann} મણ
                          </span>
                        </td>
                      </tr>

                      {/* Row 7: કુલ મદતર */}
                      <tr className="bg-emerald-50/40">
                        <td className="p-3 sm:p-3.5 font-extrabold text-emerald-950 w-1/3 border-r-2 border-stone-800 bg-emerald-100/40">
                          કુલ મદતર
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-emerald-900 font-semibold">નેટ વજન અથવા મણ માં વજન x પાક વેચ્યા નો ભાવ</span>
                          <span className="font-extrabold text-emerald-700 text-lg">
                            {formatINR(hisab.totalMadatar)}
                          </span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                {/* 3. CALCULATION TABLE (BOTTOM OF PAGE 1) */}
                <div className="border-2 border-stone-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y-2 divide-stone-800 font-medium">
                      
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          કુલ મદતર
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">પાક વેચાણ થી મળેલ રકમ હોય તે</span>
                          <span className="font-extrabold text-stone-950 text-sm">
                            {formatINR(hisab.totalMadatar)}
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          કુલ ખર્ચ રકમ
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">કુલ ખર્ચ કરવામાં આવ્યો હોય તે</span>
                          <span className="font-extrabold text-amber-700 text-sm">
                            - {formatINR(hisab.totalKharch)}
                          </span>
                        </td>
                      </tr>

                      <tr className="bg-sky-50/50">
                        <td className="p-3 sm:p-3.5 font-extrabold text-sky-950 w-1/3 border-r-2 border-stone-800 bg-sky-100/50">
                          ખર્ચ કપાત મદતર
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-sky-900 font-bold">“કુલ મદતર – કુલ ખર્ચ રકમ = ખર્ચ કપાત મદતર “</span>
                          <span className="font-extrabold text-sky-800 text-base">
                            {formatINR(hisab.kharchKapatMadatar)}
                          </span>
                        </td>
                      </tr>

                      <tr className="bg-stone-100/80">
                        <td className="p-3 sm:p-3.5 font-extrabold text-stone-950 w-1/3 border-r-2 border-stone-800">
                          ભાગે આવતી રકમ
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-700 font-bold">“ખર્ચ કપાત મદતર / ૨” ({partnerShare}%)</span>
                          <span className="font-extrabold text-stone-950 text-base">
                            {formatINR(hisab.bhageAavtiRakamPartner)}
                          </span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

              </div>

              {/* PAGE 2 CONTAINER: PARTNER HISAB & FINAL RESOLUTION */}
              <div className="border-2 border-stone-800 rounded-2xl p-6 sm:p-8 bg-white shadow-sm print:border-stone-900 print:shadow-none space-y-6">
                
                {/* Section Header */}
                <div className="pb-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-950 tracking-tight font-serif">
                    પાર્ટનર ના ભાગ નો હિસાબ :
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    ભાગીદાર: <strong>{partnerName}</strong> ({partnerShare}% હિસ્સો)
                  </p>
                </div>

                {/* Partner Hisab Table */}
                <div className="border-2 border-stone-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y-2 divide-stone-800 font-medium">
                      
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          ભાગે આવતી રકમ
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">જે ભાગે રકમ આવી તે</span>
                          <span className="font-extrabold text-stone-950 text-sm">
                            {formatINR(hisab.bhageAavtiRakamPartner)}
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3 sm:p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          કુલ ઉપાડ રકમ
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">પાર્ટનર એ જે ઉપાડ કર્યો કે એના ભાગનો ખર્ચ હતો તે</span>
                          <span className="font-extrabold text-amber-700 text-sm">
                            - {formatINR(hisab.totalUpad)}
                          </span>
                        </td>
                      </tr>

                      <tr className="bg-indigo-50/50">
                        <td className="p-3 sm:p-3.5 font-extrabold text-indigo-950 w-1/3 border-r-2 border-stone-800 bg-indigo-100/50">
                          પાર્ટનર ના ભાગે આવતી રકમ
                        </td>
                        <td className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-indigo-900 font-bold">“ભાગે આવતી રકમ – કુલ ઉપાડ રકમ = પાર્ટનર ના ભાગે આવતી રકમ”</span>
                          <span className={`font-extrabold text-base ${hisab.partnerNetShare >= 0 ? 'text-indigo-900' : 'text-red-700'}`}>
                            {formatINR(hisab.partnerNetShare)}
                          </span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                {/* Final Resolution Section Header */}
                <div className="pt-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-stone-950 tracking-tight font-serif">
                    વિગત :
                  </h3>
                </div>

                {/* Final Resolution Table */}
                <div className="border-2 border-stone-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y-2 divide-stone-800 font-medium">
                      
                      {/* મને મળેલ રકમ */}
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          મને મળેલ રકમ
                        </td>
                        <td className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">“ ભાગે આવતી રકમ “ (Owner's Net Return)</span>
                          <span className="font-extrabold text-emerald-800 text-base">
                            {formatINR(hisab.maneMadelRakam)}
                          </span>
                        </td>
                      </tr>

                      {/* પાર્ટનર ને મળેલ રકમ */}
                      <tr className="hover:bg-stone-50/60">
                        <td className="p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          પાર્ટનર ને મળેલ રકમ
                        </td>
                        <td className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">“પાર્ટનર ના ભાગે આવતી રકમ “</span>
                          <span className="font-extrabold text-indigo-900 text-base">
                            {formatINR(hisab.partnerNeMadelRakam)}
                          </span>
                        </td>
                      </tr>

                      {/* પાર્ટનર ની જોડે લેવાની રકમ */}
                      <tr className={`${hisab.partnerJodeLevaniRakam > 0 ? 'bg-amber-100/60' : 'hover:bg-stone-50/60'}`}>
                        <td className="p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          પાર્ટનર ની જોડે લેવાની રકમ
                        </td>
                        <td className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">
                            {hisab.partnerJodeLevaniRakam > 0 
                              ? 'ઉપાડ વધુ લીધેલ હોવાથી પાર્ટનર પાસેથી વસૂલવાની રકમ' 
                              : 'કોઈ રકમ લેવાની નથી'}
                          </span>
                          <span className={`font-extrabold text-base ${hisab.partnerJodeLevaniRakam > 0 ? 'text-amber-800' : 'text-stone-400'}`}>
                            {hisab.partnerJodeLevaniRakam > 0 ? formatINR(hisab.partnerJodeLevaniRakam) : '₹0'}
                          </span>
                        </td>
                      </tr>

                      {/* પાર્ટનર ને આપવાની રકમ */}
                      <tr className={`${hisab.partnerNeAapvaniRakam > 0 ? 'bg-emerald-100/60' : 'hover:bg-stone-50/60'}`}>
                        <td className="p-3.5 font-bold text-stone-900 w-1/3 border-r-2 border-stone-800 bg-stone-100/50">
                          પાર્ટનર ને આપવાની રકમ
                        </td>
                        <td className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-stone-600">
                            {hisab.partnerNeAapvaniRakam > 0 
                              ? 'ચોખ્ખો નફો બાદ ઉપાડ ચૂકવવાની ચોખ્ખી બાકી રકમ' 
                              : 'કોઈ રકમ આપવાની નથી'}
                          </span>
                          <span className={`font-extrabold text-base ${hisab.partnerNeAapvaniRakam > 0 ? 'text-emerald-800' : 'text-stone-400'}`}>
                            {hisab.partnerNeAapvaniRakam > 0 ? formatINR(hisab.partnerNeAapvaniRakam) : '₹0'}
                          </span>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                {/* Sign-off Seal Footer */}
                <div className="pt-6 border-t border-stone-300 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-stone-500">
                  <div>
                    તારીખ: <strong>{formatDate(new Date().toISOString())}</strong>
                  </div>
                  <div className="flex gap-8">
                    <span>માલિક સહી: ______________</span>
                    {hasPartner && <span>પાર્ટનર સહી: ______________</span>}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: DETAILED EXPENSES BREAKDOWN                       */}
          {/* ======================================================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-600 uppercase">કુલ થયેલ ખર્ચ</span>
                <span className="text-lg font-extrabold text-amber-700">{formatINR(hisab.totalKharch)}</span>
              </div>

              {(crop.expenses || []).length > 0 ? (
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100 text-xs">
                  {(crop.expenses || []).map((exp, idx) => (
                    <div key={exp.id || idx} className="p-3.5 flex items-center justify-between hover:bg-stone-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 uppercase text-[11px] bg-stone-100 px-2 py-0.5 rounded">
                            {exp.category}
                          </span>
                          <span className="text-stone-400 text-[11px]">{formatDate(exp.date)}</span>
                          <span className="text-[10px] text-stone-500">({exp.paidBy || 'owner'})</span>
                        </div>
                        {exp.notes && <p className="text-stone-600 text-[11px] mt-1">{exp.notes}</p>}
                      </div>
                      <span className="font-extrabold text-stone-900 text-sm">{formatINR(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-8">હજી કોઈ ખર્ચ નોંધાયેલ નથી.</p>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DETAILED UPAD (DRAWINGS) BREAKDOWN                */}
          {/* ======================================================== */}
          {activeTab === 'upad' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-600 uppercase">પાર્ટનર નો કુલ ઉપાડ</span>
                <span className="text-lg font-extrabold text-amber-700">{formatINR(hisab.totalUpad)}</span>
              </div>

              {(crop.upad || []).length > 0 ? (
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100 text-xs">
                  {(crop.upad || []).map((u, idx) => (
                    <div key={u.id || idx} className="p-3.5 flex items-center justify-between hover:bg-stone-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            {u.recipient || partnerName}
                          </span>
                          <span className="text-stone-400 text-[11px]">{formatDate(u.date)}</span>
                        </div>
                        {u.notes && <p className="text-stone-600 text-[11px] mt-1">{u.notes}</p>}
                      </div>
                      <span className="font-extrabold text-amber-700 text-sm">{formatINR(u.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-8">કોઈ ઉપાડ નોંધાયેલ નથી.</p>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: DETAILED SALES & WEIGHMENT ENTRIES                */}
          {/* ======================================================== */}
          {activeTab === 'sales' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 uppercase">કુલ મદતર (પાક વેચાણ)</span>
                <span className="text-lg font-extrabold text-emerald-800">{formatINR(hisab.totalMadatar)}</span>
              </div>

              {(crop.sales || []).length > 0 ? (
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100 text-xs">
                  {(crop.sales || []).map((s, idx) => (
                    <div key={s.id || idx} className="p-4 hover:bg-stone-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded text-xs">
                            {s.weightInMann} મણ ({s.netWeightKg} kg)
                          </span>
                          <span className="text-stone-400 text-[11px]">{formatDate(s.date)}</span>
                          {s.buyer && <span className="text-stone-600 text-[11px] font-semibold">• {s.buyer}</span>}
                        </div>
                        <span className="font-extrabold text-emerald-700 text-base">{formatINR(s.totalMadatar)}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-[11px] text-stone-500 bg-stone-50/70 p-2 rounded-xl">
                        <div>ગ્રોસ: <strong>{s.grossWeightKg} kg</strong></div>
                        <div>અન્ય: <strong>{s.otherWeightKg || 0} kg</strong></div>
                        <div>કપાત: <strong>{s.weightDeductionKg || 0} kg</strong></div>
                        <div>ભાવ: <strong>₹{s.ratePerMann}/મણ</strong></div>
                      </div>

                      {s.notes && <p className="text-[11px] text-stone-500 italic">"{s.notes}"</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-8">હજી કોઈ પાક વેચાણ કે મદતર નોંધાયેલ નથી.</p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
