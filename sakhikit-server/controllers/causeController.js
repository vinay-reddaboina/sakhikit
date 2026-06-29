import Cause from '../models/Cause.js';
import NGO from '../models/NGO.js';

// POST /api/causes — ngo_admin creates a cause
export const createCause = async (req, res) => {
  try {
    const ngo = await NGO.findOne({
      adminId: req.dbUser._id,
      verificationStatus: 'verified',
    });
    if (!ngo) {
      return res.status(403).json({ message: 'Only verified NGOs can create causes' });
    }
    const cause = await Cause.create({ ...req.body, ngoId: ngo._id });
    res.status(201).json({ message: 'Cause created', cause });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create cause', error: error.message });
  }
};

// GET /api/causes — public listing
export const getCauses = async (req, res) => {
  try {
    const { status = 'active', state, limit = 12, page = 1 } = req.query;
    const filter = { isActive: true, status };
    if (state) filter['location.state'] = state;

    const total = await Cause.countDocuments(filter);
    const causes = await Cause.find(filter)
      .populate('ngoId', 'name location logo verificationStatus')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      causes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch causes', error: error.message });
  }
};

// GET /api/causes/:id — single cause
export const getCauseById = async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id).populate(
      'ngoId',
      'name description location contact logo verificationStatus'
    );
    if (!cause) return res.status(404).json({ message: 'Cause not found' });
    res.json({ cause });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cause', error: error.message });
  }
};

// GET /api/causes/ngo/mine — ngo_admin's own causes
export const getMyCauses = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ adminId: req.dbUser._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    const causes = await Cause.find({ ngoId: ngo._id }).sort({ createdAt: -1 });
    res.json({ count: causes.length, causes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch causes', error: error.message });
  }
};

// PATCH /api/causes/:id — ngo_admin updates their cause
export const updateCause = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ adminId: req.dbUser._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    const cause = await Cause.findOneAndUpdate(
      { _id: req.params.id, ngoId: ngo._id },
      req.body,
      { new: true }
    );
    if (!cause) return res.status(404).json({ message: 'Cause not found or unauthorized' });
    res.json({ message: 'Cause updated', cause });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update cause', error: error.message });
  }
};

// DELETE /api/causes/:id — ngo_admin cancels their cause
export const deleteCause = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ adminId: req.dbUser._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    const cause = await Cause.findOneAndUpdate(
      { _id: req.params.id, ngoId: ngo._id },
      { status: 'cancelled', isActive: false },
      { new: true }
    );
    if (!cause) return res.status(404).json({ message: 'Cause not found or unauthorized' });
    res.json({ message: 'Cause cancelled', cause });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel cause', error: error.message });
  }
};

// GET /api/causes/stats — public impact numbers for homepage
export const getCauseStats = async (req, res) => {
  try {
    const [totalCauses, totalFunded, pipeline] = await Promise.all([
      Cause.countDocuments({ isActive: true }),
      Cause.countDocuments({ status: 'funded' }),
      Cause.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalKitsFunded: { $sum: '$kitsFunded' },
            totalBeneficiaries: { $sum: '$beneficiaryCount' },
            totalAmountRaised: { $sum: { $multiply: ['$kitsFunded', '$costPerKit'] } },
          },
        },
      ]),
    ]);

    const stats = pipeline[0] || {
      totalKitsFunded: 0,
      totalBeneficiaries: 0,
      totalAmountRaised: 0,
    };

    res.json({ totalCauses, totalFunded, ...stats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
