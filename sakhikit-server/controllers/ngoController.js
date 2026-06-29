import NGO from '../models/NGO.js';
import User from '../models/User.js';

// POST /api/ngos — register a new NGO (ngo_admin only)
export const registerNGO = async (req, res) => {
  try {
    const existing = await NGO.findOne({ adminId: req.dbUser._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a registered NGO' });
    }
    const ngo = await NGO.create({ ...req.body, adminId: req.dbUser._id });
    res.status(201).json({ message: 'NGO registered, pending verification', ngo });
  } catch (error) {
    res.status(400).json({ message: 'Failed to register NGO', error: error.message });
  }
};

// GET /api/ngos — public list of verified NGOs
export const getVerifiedNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({ verificationStatus: 'verified', isActive: true })
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ count: ngos.length, ngos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch NGOs', error: error.message });
  }
};

// GET /api/ngos/pending — platform_admin only
export const getPendingNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({ verificationStatus: 'pending' })
      .populate('adminId', 'name email')
      .sort({ createdAt: 1 });
    res.json({ count: ngos.length, ngos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending NGOs', error: error.message });
  }
};

// GET /api/ngos/mine — ngo_admin's own NGO
export const getMyNGO = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ adminId: req.dbUser._id });
    if (!ngo) return res.status(404).json({ message: 'No NGO found for this account' });
    res.json({ ngo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch NGO', error: error.message });
  }
};

// GET /api/ngos/:id — public single NGO
export const getNGOById = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate('adminId', 'name email');
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ ngo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch NGO', error: error.message });
  }
};

// PATCH /api/ngos/:id/verify — platform_admin only
export const verifyNGO = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be verified or rejected' });
    }
    const update = {
      verificationStatus: status,
      verifiedBy: req.dbUser._id,
      verifiedAt: new Date(),
      ...(rejectionReason && { rejectionReason }),
    };
    const ngo = await NGO.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });

    // Promote the NGO admin's role to ngo_admin if verified
    if (status === 'verified') {
      await User.findByIdAndUpdate(ngo.adminId, { role: 'ngo_admin' });
    }
    res.json({ message: `NGO ${status}`, ngo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify NGO', error: error.message });
  }
};
