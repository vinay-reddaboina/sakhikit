import { useAuth0 } from '@auth0/auth0-react';

export default function AuthButtons() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  if (isLoading) {
    return <span className="text-sakhi-500 text-sm">Loading...</span>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sakhi-900 text-sm font-medium">
          {user?.name}
        </span>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className="px-4 py-2 bg-sakhi-100 text-sakhi-700 rounded-lg text-sm font-medium hover:bg-sakhi-200 transition"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="px-4 py-2 bg-sakhi-700 text-white rounded-lg text-sm font-medium hover:bg-sakhi-900 transition"
    >
      Log In
    </button>
  );
}