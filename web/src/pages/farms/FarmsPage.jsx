import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useCurrentCropStore } from '../../store/useCurrentCropStore.js';
import { Plus, Sprout, Activity } from 'lucide-react';
import FarmCard from '../../components/FarmCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';

export default function FarmsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { farms, fetchFarms, loading } = useFarmStore();
  const { fetchCrops } = useCurrentCropStore();

  useEffect(() => {
    const uid = profile?.uid || 'default';
    fetchFarms(uid);
    fetchCrops(uid);
  }, [profile, fetchFarms, fetchCrops]);

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Farms</h1>
          <p className="text-xs text-stone-400 font-medium mt-1 max-w-xl">
            Farm parcel master details, real-time ongoing crop status, and historical yield analytics. Day-to-day expenses and profits are logged inside <strong>Current State</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => navigate('/current-state')}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Go to Current State
          </button>

          <button
            onClick={() => navigate('/farms/new')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Farm
          </button>
        </div>
      </div>

      {/* Grid items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton height="h-52" />
          <LoadingSkeleton height="h-52" />
          <LoadingSkeleton height="h-52" />
        </div>
      ) : farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              unitPreference={profile?.unitPreference || 'bigha'}
              onClick={() => navigate(`/farms/${farm.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState
            icon="Sprout"
            message="You haven't added any farms yet. Add a farm to view master specs and track crop cycles."
            btnLabel="Add Your First Farm"
            onBtnPress={() => navigate('/farms/new')}
          />
        </div>
      )}

    </div>
  );
}
