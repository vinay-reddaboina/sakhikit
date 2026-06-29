import { auth } from 'express-oauth2-jwt-bearer';
import User from '../models/User.js';

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});

// Loads the MongoDB user matching the JWT and attaches to req.dbUser
export const loadUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await User.findOne({ auth0Id });
    if (!user) return res.status(404).json({ message: 'User not synced' });
    req.dbUser = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Failed to load user', error: err.message });
  }
};

// Restricts a route to specific roles
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.dbUser || !roles.includes(req.dbUser.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};