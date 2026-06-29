import { useState, useEffect } from 'react';
import { useApi } from '../lib/useApi';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export default function PostImpactUpdatePage() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { getMyCauses, createImpactUpdate } = useApi();
  const navigate = useNavigate();
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [form, setForm] = useState({
    causeId: '',
    title: '',
    description: '',
    beneficiariesReached: '',
    kitsDistributed: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      getMyCauses()
        .then((data) => setCauses(data.causes || []))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const token = await getAccessTokenSilently();
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${BASE_URL}/api/impact/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) setUploadedPhotos([...uploadedPhotos, data.url]);
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createImpactUpdate({
        ...form,
        beneficiariesReached: Number(form.beneficiariesReached),
        kitsDistributed: Number(form.kitsDistributed),
        photos: uploadedPhotos,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 text-center max-w-md shadow-md">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-sakhi-900 mb-2">Update Posted!</h2>
        <p className="text-gray-600 mb-6">Donors have been notified by email.</p>
        <button onClick={() => navigate('/ngo-dashboard')}
          className="bg-sakhi-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sakhi-50 py-10">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-sakhi-900 mb-2">Post Impact Update</h1>
        <p className="text-gray-600 mb-8">Share progress with your donors.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-sakhi-100 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Cause *</label>
            <select name="causeId" value={form.causeId} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300">
              <option value="">Select a cause...</option>
              {causes.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="e.g. First distribution completed in Gaya!"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              placeholder="Share the story of your distribution..."
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Girls Reached</label>
              <input type="number" name="beneficiariesReached" value={form.beneficiariesReached} onChange={handleChange} min="0"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kits Distributed</label>
              <input type="number" name="kitsDistributed" value={form.kitsDistributed} onChange={handleChange} min="0"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <span className="px-4 py-2 bg-sakhi-50 border border-sakhi-200 rounded-lg text-sm text-sakhi-700 hover:bg-sakhi-100 transition">
                {uploading ? 'Uploading...' : '+ Add Photo'}
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
            </label>
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {uploadedPhotos.map((url, i) => (
                  <img key={i} src={url} alt={`upload ${i}`} className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-sakhi-700 text-white py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Update & Notify Donors'}
          </button>
        </form>
      </div>
    </div>
  );
}
