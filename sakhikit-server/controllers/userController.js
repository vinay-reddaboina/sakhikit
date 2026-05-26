import User from '../models/User.js';

// POST /api/users/test
// Creates a test user — REMOVE THIS before deployment
export const createTestUser = async (req, res) => {
  try {
    const testUser = await User.create({
      auth0Id: `test|${Date.now()}`,
      email: `testuser${Date.now()}@sakhikit.com`,
      name: 'Test Donor',
      role: 'donor',
    });

    res.status(201).json({
      message: 'Test user created successfully',
      user: testUser,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create test user',
      error: error.message,
    });
  }
};

// GET /api/users/all
// Returns all users — REMOVE THIS before deployment
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};