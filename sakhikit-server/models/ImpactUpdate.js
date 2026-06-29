import mongoose from 'mongoose';

const impactUpdateSchema = new mongoose.Schema(
  {
    causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    photos: [{ type: String }],
    beneficiariesReached: { type: Number, default: 0 },
    kitsDistributed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ImpactUpdate = mongoose.model('ImpactUpdate', impactUpdateSchema);
export default ImpactUpdate;
