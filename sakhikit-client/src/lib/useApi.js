import { useAuth0 } from '@auth0/auth0-react';
import { authApi } from './api';

export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  const withToken = (fn) => async (...args) => {
    const token = await getAccessTokenSilently();
    return fn(token, ...args);
  };

  return {
    syncUser: withToken(authApi.syncUser),
    getMe: withToken(authApi.getMe),
    registerNGO: withToken(authApi.registerNGO),
    getMyNGO: withToken(authApi.getMyNGO),
    getPendingNGOs: withToken(authApi.getPendingNGOs),
    verifyNGO: withToken(authApi.verifyNGO),
    createCause: withToken(authApi.createCause),
    getMyCauses: withToken(authApi.getMyCauses),
    updateCause: withToken(authApi.updateCause),
    deleteCause: withToken(authApi.deleteCause),
  };
}