import ImpactUpdate from '../models/ImpactUpdate.js';
import NGO from '../models/NGO.js';
import Donation from '../models/Donation.js';
import cloudinary from '../config/cloudinary.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/impact — ngo_admin posts an update
export const createImpactUpdate = async (req, res) => {
  try {
    const ngo = await NGO.findOne({
      adminId: req.dbUser._id,
      verificationStatus: 'verified',
    });
    if (!ngo) return res.status(403).json({ message: 'Verified NGO required' });

    const { causeId, title, description, beneficiariesReached, kitsDistributed, photos } = req.body;

    const update = await ImpactUpdate.create({
      causeId,
      ngoId: ngo._id,
      title,
      description,
      beneficiariesReached: Number(beneficiariesReached) || 0,
      kitsDistributed: Number(kitsDistributed) || 0,
      photos: photos || [],
    });

    // Send email receipts to all donors of this cause
    await sendImpactEmails(causeId, update, ngo);

    res.status(201).json({ message: 'Impact update posted', update });
  } catch (error) {
    res.status(400).json({ message: 'Failed to post update', error: error.message });
  }
};

// GET /api/impact/cause/:causeId — public
export const getImpactByCause = async (req, res) => {
  try {
    const updates = await ImpactUpdate.find({ causeId: req.params.causeId })
      .populate('ngoId', 'name logo')
      .sort({ createdAt: -1 });
    res.json({ count: updates.length, updates });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch updates', error: error.message });
  }
};

// GET /api/impact/all — all updates for the map / homepage
export const getAllImpactUpdates = async (req, res) => {
  try {
    const updates = await ImpactUpdate.find({})
      .populate('causeId', 'title location')
      .populate('ngoId', 'name location')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ count: updates.length, updates });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch updates', error: error.message });
  }
};

// POST /api/impact/upload-photo — upload photo to Cloudinary
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'sakhikit/impact', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Helper — email all donors when NGO posts an impact update
async function sendImpactEmails(causeId, update, ngo) {
  try {
    const donations = await Donation.find({
      causeId,
      status: 'completed',
    }).populate('donorId', 'name email');

    const uniqueDonors = [];
    const seen = new Set();
    for (const d of donations) {
      if (d.donorId?.email && !seen.has(d.donorId.email)) {
        seen.add(d.donorId.email);
        uniqueDonors.push(d.donorId);
      }
    }

    for (const donor of uniqueDonors) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: donor.email,
        subject: `Update from ${ngo.name} — your donation is creating impact! 💝`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #831843; padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">SakhiKit Impact Update</h1>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #fce7f3; border-radius: 0 0 12px 12px;">
              <p style="color: #4b5563;">Hi ${donor.name},</p>
              <p style="color: #4b5563;">
                Great news! <strong>${ngo.name}</strong> just posted an update on a cause you supported.
              </p>
              <div style="background: #fdf2f8; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <h2 style="color: #831843; margin-top: 0;">${update.title}</h2>
                <p style="color: #4b5563;">${update.description}</p>
                <p style="color: #be185d; font-weight: bold;">
                  👧 ${update.beneficiariesReached} girls reached · 
                  📦 ${update.kitsDistributed} kits distributed
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Thank you for making this possible. Your donation is keeping girls in school.
              </p>
              <a href="${process.env.CLIENT_URL}/causes" 
                style="display: inline-block; background: #be185d; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
                View All Causes
              </a>
            </div>
          </div>
        `,
      });
    }
    console.log(`📧 Impact emails sent to ${uniqueDonors.length} donors`);
  } catch (err) {
    console.error('Email sending failed:', err.message);
  }
}
