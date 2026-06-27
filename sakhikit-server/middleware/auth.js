import { auth } from 'express-oauth2-jwt-bearer';

// Verifies the Auth0-issued access token on protected routes.
// On success, req.auth.payload.sub holds the verified Auth0 user id.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

export default checkJwt;
