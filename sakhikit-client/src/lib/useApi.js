import { useAuth0 } from '@auth0/auth0-react';
import { authApi } from './api';

// Hook that wraps authApi calls, automatically fetching a fresh token each time.
export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  // Wrap each authApi method so callers don't deal with tokens directly.
  const syncUser = async () => {
    const token = await getAccessTokenSilently();
    return authApi.syncUser(token);
  };

  const getMe = async () => {
    const token = await getAccessTokenSilently();
    return authApi.getMe(token);
  };

  return { syncUser, getMe };
}