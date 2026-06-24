import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api } from './lib/api';
import { useApi } from './lib/useApi';
import AuthButtons from './components/shared/AuthButtons';

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { syncUser } = useApi();
  const [serverStatus, setServerStatus] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [error, setError] = useState(null);

  // Check server is alive (public)
  useEffect(() => {
    api.getHealth()
      .then(setServerStatus)
      .catch((err) => setError(err.message));
  }, []);

  // Sync user into our DB once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      syncUser()
        .then((res) => setDbUser(res.user))
        .catch((err) => console.error('Sync failed:', err.message));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-sakhi-50">
      <nav className="bg-white border-b border-sakhi-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sakhi-900">SakhiKit</h1>
        <AuthButtons />
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8 mt-8">
          <h2 className="text-4xl font-bold text-sakhi-900 mb-3">
            Fighting period poverty, one kit at a time.
          </h2>
        </div>

        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-sakhi-100 mb-4">
            <h3 className="text-lg font-semibold text-sakhi-900 mb-2">
              👋 Welcome, {user?.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">Email: {user?.email}</p>
            {dbUser && (
              <div className="bg-sakhi-50 rounded p-3 mt-2">
                <p className="text-sm text-sakhi-700">
                  ✅ Synced to database · Role:{' '}
                  <span className="font-semibold">{dbUser.role}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 border border-sakhi-100">
          <h3 className="text-lg font-semibold text-sakhi-900 mb-3">
            🔌 Server Connection
          </h3>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {serverStatus && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 font-medium">✅ Server connected</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;