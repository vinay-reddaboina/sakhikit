import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import DonationModal from '../components/shared/DonationModal';

export default function CauseDetailPage() {
  const { id } = useParams();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.getCauseById(id)
      .then((data) => { setCause(data.cause); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <p className="text-sakhi-700">Loading...</p>
    </div>
  );

  if (!cause) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <p className="text-red-600">Cause not found.</p>
    </div>
  );

  const percent = cause.percentFunded || 0;

  return (
    <div className="min-h-screen bg-sakhi-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {cause.coverImage && (
          <img src={cause.coverImage} alt={cause.title}
            className="w-full h-64 object-cover rounded-xl mb-6" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <span className="text-xs bg-sakhi-100 text-sakhi-700 px-3 py-1 rounded-full font-medium uppercase tracking-wide">
              {cause.beneficiaryType?.replace('_', ' ')}
            </span>
            <h1 className="text-3xl font-bold text-sakhi-900 mt-3 mb-4">{cause.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{cause.description}</p>

            {cause.ngoId && (
              <div className="bg-white rounded-lg p-4 border border-sakhi-100">
                <p className="text-sm text-gray-500 mb-1">Organised by</p>
                <p className="font-semibold text-sakhi-900">{cause.ngoId.name}</p>
                {cause.ngoId.location?.city && (
                  <p className="text-sm text-gray-500">
                    {cause.ngoId.location.city}, {cause.ngoId.location.state}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-sakhi-100 h-fit">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{cause.kitsFunded} kits funded</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full bg-sakhi-100 rounded-full h-3">
                <div className="bg-sakhi-500 h-3 rounded-full transition-all"
                  style={{ width: `${percent}%` }} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Goal: {cause.kitsNeeded} kits</p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>💰 ₹{cause.costPerKit} per kit</p>
              <p>👧 {cause.beneficiaryCount} girls</p>
              <p>📅 {new Date(cause.deadline).toLocaleDateString('en-IN')}</p>
              {cause.location?.city && (
                <p>📍 {cause.location.city}, {cause.location.state}</p>
              )}
            </div>

            {cause.status === 'active' ? (
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-sakhi-700 text-white py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition"
              >
                Donate Now
              </button>
            ) : (
              <div className="text-center bg-green-50 rounded-lg p-3">
                <p className="text-green-700 font-semibold">✅ Fully Funded!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <DonationModal cause={cause} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
