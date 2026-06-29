import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../lib/useApi';

export default function NGODashboardPage() {
  const { getMyNGO, getMyCauses } = useApi();
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyNGO(), getMyCauses()])
      .then(([ngoData, causesData]) => {
        setNgo(ngoData.ngo);
        setCauses(causesData.causes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <p className="text-sakhi-700">Loading dashboard...</p>
    </div>
  );

  if (!ngo) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">You don't have a registered NGO yet.</p>
        <Link to="/register-ngo"
          className="bg-sakhi-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition">
          Register NGO
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sakhi-50 py-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* NGO header */}
        <div className="bg-white rounded-xl border border-sakhi-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sakhi-900">{ngo.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{ngo.location?.city}, {ngo.location?.state}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ngo.verificationStatus === 'verified'
                ? 'bg-green-100 text-green-700'
                : ngo.verificationStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {ngo.verificationStatus}
            </span>
          </div>
        </div>

        {/* Causes */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-sakhi-900">Your Causes</h2>
          {ngo.verificationStatus === 'verified' && (
            <button
              onClick={() => navigate('/create-cause')}
              className="bg-sakhi-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sakhi-900 transition">
              + New Cause
            </button>
          )}
        </div>

        {causes.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-sakhi-100">
            <p className="text-gray-400">No causes yet.</p>
            {ngo.verificationStatus === 'pending' && (
              <p className="text-yellow-600 text-sm mt-2">
                Your NGO is pending verification. You can create causes once approved.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {causes.map((cause) => (
              <div key={cause._id} className="bg-white rounded-xl border border-sakhi-100 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sakhi-900">{cause.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {cause.kitsFunded}/{cause.kitsNeeded} kits · ₹{cause.costPerKit}/kit · {cause.location?.city}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    cause.status === 'active' ? 'bg-green-100 text-green-700' :
                    cause.status === 'funded' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {cause.status}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-sakhi-100 rounded-full h-2">
                    <div className="bg-sakhi-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((cause.kitsFunded / cause.kitsNeeded) * 100))}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
