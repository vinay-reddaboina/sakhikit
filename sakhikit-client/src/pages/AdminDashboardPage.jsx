import { useState, useEffect } from 'react';
import { useApi } from '../lib/useApi';

export default function AdminDashboardPage() {
  const { getPendingNGOs, verifyNGO } = useApi();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPendingNGOs()
      .then((data) => { setNgos(data.ngos); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const handleVerify = async (id, status) => {
    setActionLoading(id + status);
    try {
      await verifyNGO(id, { status });
      setNgos(ngos.filter((n) => n._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <PageWrapper><p className="text-sakhi-700">Loading...</p></PageWrapper>;
  if (error) return <PageWrapper><p className="text-red-600">{error}</p></PageWrapper>;

  return (
    <div className="min-h-screen bg-sakhi-50 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-sakhi-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Review and verify NGO registrations.</p>

        {ngos.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-sakhi-100">
            <p className="text-4xl mb-4">✅</p>
            <p className="text-gray-500">No pending NGOs. All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ngos.map((ngo) => (
              <div key={ngo._id} className="bg-white rounded-xl border border-sakhi-100 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-sakhi-900">{ngo.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">Reg. No: {ngo.registrationNumber}</p>
                    <p className="text-sm text-gray-600 mb-3">{ngo.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {ngo.location?.city && (
                        <span>📍 {ngo.location.city}, {ngo.location.state}</span>
                      )}
                      {ngo.contact?.email && (
                        <span>✉️ {ngo.contact.email}</span>
                      )}
                      {ngo.adminId && (
                        <span>👤 {ngo.adminId.name} ({ngo.adminId.email})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleVerify(ngo._id, 'verified')}
                      disabled={actionLoading === ngo._id + 'verified'}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {actionLoading === ngo._id + 'verified' ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleVerify(ngo._id, 'rejected')}
                      disabled={actionLoading === ngo._id + 'rejected'}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition disabled:opacity-50"
                    >
                      {actionLoading === ngo._id + 'rejected' ? '...' : '✕ Reject'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Submitted {new Date(ngo.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      {children}
    </div>
  );
}
