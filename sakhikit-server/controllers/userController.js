import User from '../models/User.js';

// POST /api/users/sync — create or update the logged-in user
export const syncUser = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const namespace = process.env.AUTH0_NAMESPACE;

    // Auth0 Action injects these custom claims; fall back gracefully
    const email = req.auth.payload[`${namespace}/email`] || req.body.email;
    const name = req.auth.payload[`${namespace}/name`] || req.body.name || 'SakhiKit User';
    const picture = req.auth.payload[`${namespace}/picture`] || req.body.picture || '';

    const user = await User.findOneAndUpdate(
      { auth0Id },
      {
        auth0Id,
        ...(email && { email }),
        name,
        picture,
        lastLogin: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'User synced', user });
  } catch (error) {
    res.status(400).json({ message: 'Sync failed', error: error.message });
  }
};

// GET /api/users/me — current user's DB profile
export const getMe = async (req, res) => {
  res.json({ user: req.dbUser });
};

// GET /api/users/all — admin only
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// PATCH /api/users/:id/role — admin promotes/demotes
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['donor', 'ngo_admin', 'platform_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
};