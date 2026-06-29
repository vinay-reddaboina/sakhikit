import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../lib/useApi';

export default function CreateCausePage() {
  const { createCause } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    beneficiaryType: 'school',
    beneficiaryCount: '',
    kitsNeeded: '',
    costPerKit: '',
    deadline: '',
    'location.city': '',
    'location.state': '',
    'location.address': '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        title: form.title,
        description: form.description,
        beneficiaryType: form.beneficiaryType,
        beneficiaryCount: Number(form.beneficiaryCount),
        kitsNeeded: Number(form.kitsNeeded),
        costPerKit: Number(form.costPerKit),
        deadline: form.deadline,
        location: {
          city: form['location.city'],
          state: form['location.state'],
          address: form['location.address'],
        },
      };
      const res = await createCause(data);
      navigate(`/causes/${res.cause._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sakhi-50 py-10">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-sakhi-900 mb-2">Create a Cause</h1>
        <p className="text-gray-600 mb-8">List a need for your beneficiaries.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-sakhi-100 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300"
              placeholder="e.g. Menstrual kits for 100 girls in rural Odisha" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300"
              placeholder="Describe the beneficiaries and the impact..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Type *</label>
            <select name="beneficiaryType" value={form.beneficiaryType} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300">
              <option value="school">School</option>
              <option value="shelter">Shelter</option>
              <option value="rural_community">Rural Community</option>
              <option value="urban_slum">Urban Slum</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiaries *</label>
              <input type="number" name="beneficiaryCount" value={form.beneficiaryCount} onChange={handleChange} required min="1"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kits Needed *</label>
              <input type="number" name="kitsNeeded" value={form.kitsNeeded} onChange={handleChange} required min="1"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Kit (₹) *</label>
              <input type="number" name="costPerKit" value={form.costPerKit} onChange={handleChange} required min="1"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input name="location.city" value={form['location.city']} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input name="location.state" value={form['location.state']} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-sakhi-700 text-white py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Cause'}
          </button>
        </form>
      </div>
    </div>
  );
}
