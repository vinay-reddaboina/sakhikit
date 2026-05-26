import { useState, useEffect } from 'react';
import { api } from './lib/api';

function App() {
  const [serverStatus, setServerStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHealth()
      .then((data) => {
        setServerStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-sakhi-50 p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-sakhi-900 mb-3">
            SakhiKit
          </h1>
          <p className="text-xl text-sakhi-700">
            Fighting period poverty, one kit at a time.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-sakhi-100">
          <h2 className="text-lg font-semibold text-sakhi-900 mb-3">
            🔌 Server Connection
          </h2>

          {loading && (
            <p className="text-gray-500">Checking server status...</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 font-medium">❌ Connection failed</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-red-500 text-xs mt-2">
                Is the server running? <code>cd sakhikit-server && npm run dev</code>
              </p>
            </div>
          )}

          {serverStatus && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 font-medium">✅ Server connected</p>
              <pre className="text-green-800 text-xs mt-2 overflow-auto">
                {JSON.stringify(serverStatus, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;