import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../lib/useApi';
import { useAuth0 } from '@auth0/auth0-react';

export default function RegisterNGOPage() {
  const { isAuthenticated } = useAuth0();
  const { registerNGO } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    registrationNumber: '',
    'location.address': '',
    'location.city': '',
    'location.state': '',
    'contact.phone': '',
    'contact.email': '',
    'contact.website': '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        name: form.name,
        description: form.description,
        registrationNumber: form.registrationNumber,
        location: {
          address: form['location.address'],
          city: form['location.city'],
          state: form['location.state'],
        },
        contact: {
          phone: form['contact.phone'],
          email: form['contact.email'],
          website: form['contact.website'],
        },
      };
      await registerNGO(data);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
        <p className="text-sakhi-700">Please log in to register an NGO.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-sakhi-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-md text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-sakhi-900 mb-2">NGO Registered!</h2>
          <p className="text-gray-600 mb-6">
            Your NGO is pending verification by our team. You'll be able to create causes once approved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-sakhi-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sakhi-50 py-10">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-sakhi-900 mb-2">Register your NGO</h1>
        <p className="text-gray-600 mb-8">
          Fill in your NGO details. Our team will verify and approve within 48 hours.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-sakhi-100 p-8 space-y-6">
          <Section title="Basic Information">
            <Field label="NGO Name *" name="name" value={form.name} onChange={handleChange} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300"
                placeholder="Describe your NGO's mission and work..."
              />
            </div>
            <Field label="Registration Number *" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required placeholder="e.g. MH/2019/0023456" />
          </Section>

          <Section title="Location">
            <Field label="Address" name="location.address" value={form['location.address']} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="City *" name="location.city" value={form['location.city']} onChange={handleChange} required />
              <Field label="State *" name="location.state" value={form['location.state']} onChange={handleChange} required />
            </div>
          </Section>

          <Section title="Contact Details">
            <Field label="Phone" name="contact.phone" value={form['contact.phone']} onChange={handleChange} placeholder="+91 98765 43210" />
            <Field label="Email" name="contact.email" value={form['contact.email']} onChange={handleChange} type="email" />
            <Field label="Website" name="contact.website" value={form['contact.website']} onChange={handleChange} placeholder="https://yourngo.org" />
          </Section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sakhi-700 text-white py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-sakhi-700 uppercase tracking-wide mb-4 pb-2 border-b border-sakhi-100">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300"
      />
    </div>
  );
}
