import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { getFarmWiseTotals } from '../../../../shared/services/expenseService.js';
import { Plus } from 'lucide-react';
import FarmCard from '../../components/FarmCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';

export default function FarmsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { farms, fetchFarms, loading } = useFarmStore();
  const [farmTotals, setFarmTotals] = useState({});

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
      // Fetch all-time totals for farms
      getFarmWiseTotals(profile.uid).then(data => {
        const totalsMap = {};
        data.forEach(item => {
          totalsMap[item.farmId] = item.total;
        });
        setFarmTotals(totalsMap);
      }).catch(console.error);
    }
  }, [profile, fetchFarms]);

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t('navigation.farms')}</h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Manage your land parcels and partnership share parameters.
          </p>
        </div>
        <button
          onClick={() => navigate('/farms/new')}
          className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow transition duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Farm
        </button>
      </div>

      {/* Grid items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-44" />
        </div>
      ) : farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              totalExpense={farmTotals[farm.id] || 0}
              unitPreference={profile?.unitPreference || 'bigha'}
              onClick={() => navigate(`/farms/${farm.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState
            icon="Sprout"
            message="You haven't added any farms yet. Add a farm to start recording expenses."
            btnLabel="Add Your First Farm"
            onBtnPress={() => navigate('/farms/new')}
          />
        </div>
      )}

    </div>
  );
}
