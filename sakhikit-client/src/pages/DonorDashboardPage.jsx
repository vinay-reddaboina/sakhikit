import { useState, useEffect } from 'react';
import { useApi } from '../lib/useApi';
import { useAuth0 } from '@auth0/auth0-react';

export default function DonorDashboardPage() {
  const { isAuthenticated } = useAuth0();
  const { getMyDonations } = useApi();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      getMyDonations()
        .then((data) => { setDonations(data.donations); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (loading) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <p className="text-sakhi-700">Loading your donations...</p>
    </div>
  );

  const totalKits = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.kitsCount, 0);

  const totalAmount = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-sakhi-50 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-sakhi-900 mb-8">My Donations</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-sakhi-100 p-6 text-center">
            <p className="text-4xl font-bold text-sakhi-700">{totalKits}</p>
            <p className="text-gray-500 text-sm mt-1">Kits Sponsored</p>
          </div>
          <div className="bg-white rounded-xl border border-sakhi-100 p-6 text-center">
            <p className="text-4xl font-bold text-sakhi-700">₹{totalAmount.toLocaleString()}</p>
            <p className="text-gray-500 text-sm mt-1">Total Donated</p>
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-sakhi-100">
            <p className="text-4xl mb-4">💝</p>
            <p className="text-gray-500">You haven't donated yet.</p>
            <p className="text-sakhi-700 text-sm mt-2">Browse causes and make your first donation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((d) => (
              <div key={d._id} className="bg-white rounded-xl border border-sakhi-100 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sakhi-900">
                      {d.causeId?.title || 'Cause removed'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {d.ngoId?.name} · {d.kitsCount} kit{d.kitsCount > 1 ? 's' : ''}
                      {d.isRecurring && ' · 🔄 Monthly'}
                    </p>
                    {d.message && (
                      <p className="text-xs text-gray-400 mt-1 italic">"{d.message}"</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-bold text-sakhi-700">₹{d.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      d.status === 'completed' ? 'bg-green-100 text-green-700' :
                      d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(d.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
