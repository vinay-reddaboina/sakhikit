import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from './lib/useApi';
import AuthButtons from './components/shared/AuthButtons';
import CausesPage from './pages/CausesPage';
import CauseDetailPage from './pages/CauseDetailPage';
import RegisterNGOPage from './pages/RegisterNGOPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NGODashboardPage from './pages/NGODashboardPage';
import CreateCausePage from './pages/CreateCausePage';
import DonorDashboardPage from './pages/DonorDashboardPage';

function Navbar({ dbUser }) {
  const { isAuthenticated } = useAuth0();
  return (
    <nav className="bg-white border-b border-sakhi-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <Link to="/" className="text-2xl font-bold text-sakhi-900">SakhiKit</Link>
      <div className="flex items-center gap-6">
        <Link to="/causes" className="text-sakhi-700 hover:text-sakhi-900 font-medium text-sm">
          Browse Causes
        </Link>
        {isAuthenticated && dbUser?.role === 'platform_admin' && (
          <Link to="/admin" className="text-sakhi-700 hover:text-sakhi-900 font-medium text-sm">
            Admin
          </Link>
        )}
        {isAuthenticated && dbUser?.role === 'ngo_admin' && (
          <Link to="/ngo-dashboard" className="text-sakhi-700 hover:text-sakhi-900 font-medium text-sm">
            NGO Dashboard
          </Link>
        )}
        {isAuthenticated && dbUser?.role === 'donor' && (
          <>
            <Link to="/my-donations" className="text-sakhi-700 hover:text-sakhi-900 font-medium text-sm">
              My Donations
            </Link>
            <Link to="/register-ngo" className="text-sakhi-700 hover:text-sakhi-900 font-medium text-sm">
              Register NGO
            </Link>
          </>
        )}
        <AuthButtons />
      </div>
    </nav>
  );
}

function HomePage({ dbUser }) {
  return (
    <div className="min-h-screen bg-sakhi-50">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-sakhi-900 mb-6 leading-tight">
          Fighting period poverty,<br />one kit at a time.
        </h1>
        <p className="text-xl text-sakhi-700 mb-10 max-w-2xl mx-auto">
          23 million girls drop out of school every year due to lack of menstrual hygiene.
          SakhiKit connects donors with verified NGOs to change that.
        </p>
        <Link
          to="/causes"
          className="inline-block bg-sakhi-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-sakhi-900 transition"
        >
          Browse Active Causes →
        </Link>
      </div>
      {dbUser && (
        <div className="max-w-xl mx-auto px-6 pb-10">
          <div className="bg-white rounded-lg border border-sakhi-100 p-4 text-center">
            <p className="text-sakhi-700 text-sm">
              ✅ Logged in · Role:{' '}
              <span className="font-semibold">{dbUser.role}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth0();
  const { syncUser } = useApi();
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      syncUser()
        .then((res) => setDbUser(res.user))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Navbar dbUser={dbUser} />
      <Routes>
        <Route path="/" element={<HomePage dbUser={dbUser} />} />
        <Route path="/causes" element={<CausesPage />} />
        <Route path="/causes/:id" element={<CauseDetailPage />} />
        <Route path="/register-ngo" element={<RegisterNGOPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/ngo-dashboard" element={<NGODashboardPage />} />
        <Route path="/create-cause" element={<CreateCausePage />} />
        <Route path="/my-donations" element={<DonorDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}