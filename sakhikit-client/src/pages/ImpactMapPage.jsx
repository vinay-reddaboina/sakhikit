import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { api } from '../lib/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ImpactMapPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllImpactUpdates()
      .then((data) => { setUpdates(data.updates); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Filter updates that have coordinates
  const mappable = updates.filter(
    (u) => u.causeId?.location?.coordinates?.lat && u.causeId?.location?.coordinates?.lng
  );

  return (
    <div className="min-h-screen bg-sakhi-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-sakhi-900 mb-2">Impact Map</h1>
        <p className="text-gray-600 mb-6">
          Every pin is a community where girls are staying in school.
        </p>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-sakhi-700">Loading map...</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden shadow-md border border-sakhi-100">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mappable.map((u) => (
                <Marker
                  key={u._id}
                  position={[
                    u.causeId.location.coordinates.lat,
                    u.causeId.location.coordinates.lng,
                  ]}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{u.title}</p>
                      <p className="text-gray-600">{u.causeId?.title}</p>
                      <p className="text-sakhi-700 font-medium mt-1">
                        👧 {u.beneficiariesReached} girls · 📦 {u.kitsDistributed} kits
                      </p>
                      <p className="text-gray-400 text-xs mt-1">{u.ngoId?.name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {mappable.length === 0 && !loading && (
          <div className="mt-6 bg-white rounded-xl p-8 text-center border border-sakhi-100">
            <p className="text-gray-400">
              No geo-tagged impact updates yet. Updates will appear here once NGOs post them with coordinates.
            </p>
          </div>
        )}

        {/* Impact updates list */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-sakhi-900 mb-4">
            Recent Updates ({updates.length})
          </h2>
          {updates.length === 0 ? (
            <p className="text-gray-400">No impact updates yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {updates.map((u) => (
                <div key={u._id} className="bg-white rounded-xl border border-sakhi-100 p-5 shadow-sm">
                  <h3 className="font-semibold text-sakhi-900 mb-1">{u.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{u.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-sakhi-700 font-medium">
                      👧 {u.beneficiariesReached} girls
                    </span>
                    <span className="text-sakhi-700 font-medium">
                      📦 {u.kitsDistributed} kits
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{u.ngoId?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
