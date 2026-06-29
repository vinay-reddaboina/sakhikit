import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import CauseCard from '../components/shared/CauseCard';

export default function CausesPage() {
  const [causes, setCauses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getCauses({ status: 'active' }), api.getCauseStats()])
      .then(([causesData, statsData]) => {
        setCauses(causesData.causes);
        setStats(statsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <p className="text-sakhi-700 text-lg">Loading causes...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-sakhi-50">
      {/* Stats banner */}
      {stats && (
        <div className="bg-sakhi-700 text-white py-8">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">{stats.totalKitsFunded?.toLocaleString()}</p>
              <p className="text-sakhi-100 text-sm mt-1">Kits Funded</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.totalBeneficiaries?.toLocaleString()}</p>
              <p className="text-sakhi-100 text-sm mt-1">Girls Helped</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.totalCauses}</p>
              <p className="text-sakhi-100 text-sm mt-1">Active Causes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                ₹{stats.totalAmountRaised?.toLocaleString()}
              </p>
              <p className="text-sakhi-100 text-sm mt-1">Total Raised</p>
            </div>
          </div>
        </div>
      )}

      {/* Causes grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-sakhi-900 mb-2">Active Causes</h2>
        <p className="text-sakhi-700 mb-8">
          Every kit you sponsor keeps a girl in school.
        </p>

        {causes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No active causes right now.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {causes.map((cause) => (
              <CauseCard key={cause._id} cause={cause} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
