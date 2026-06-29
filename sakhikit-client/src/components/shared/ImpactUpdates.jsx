import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function ImpactUpdates({ causeId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getImpactByCause(causeId)
      .then((data) => { setUpdates(data.updates); setLoading(false); })
      .catch(() => setLoading(false));
  }, [causeId]);

  if (loading) return null;
  if (updates.length === 0) return (
    <div className="bg-white rounded-xl border border-sakhi-100 p-6 mt-8">
      <h3 className="font-bold text-sakhi-900 mb-2">Impact Updates</h3>
      <p className="text-gray-400 text-sm">No updates yet. Check back soon.</p>
    </div>
  );

  return (
    <div className="mt-8">
      <h3 className="font-bold text-sakhi-900 text-xl mb-4">Impact Updates</h3>
      <div className="space-y-4">
        {updates.map((u) => (
          <div key={u._id} className="bg-white rounded-xl border border-sakhi-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-sakhi-900">{u.title}</h4>
              <span className="text-xs text-gray-400 shrink-0 ml-4">
                {new Date(u.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{u.description}</p>

            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-sakhi-700">{u.beneficiariesReached}</p>
                <p className="text-xs text-gray-500">Girls Reached</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sakhi-700">{u.kitsDistributed}</p>
                <p className="text-xs text-gray-500">Kits Distributed</p>
              </div>
            </div>

            {u.photos?.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {u.photos.map((photo, i) => (
                  <img key={i} src={photo} alt={`Impact ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            )}

            {u.ngoId?.name && (
              <p className="text-xs text-gray-400 mt-3">Posted by {u.ngoId.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
