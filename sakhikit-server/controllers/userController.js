import User from '../models/User.js';

// POST /api/users/sync
// Upserts the logged-in Auth0 user into our DB. Called right after login.
// auth0Id comes from the verified JWT; profile fields come from the client
// (the access token itself doesn't carry profile claims).
export const syncUser = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { email, name, picture } = req.body;

    const user = await User.findOneAndUpdate(
      { auth0Id },
      { auth0Id, email, name, picture, lastLogin: new Date() },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ user });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to sync user',
      error: error.message,
    });
  }
};

// GET /api/users/me
// Returns the logged-in user's profile from our DB.
export const getMe = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};
