import mongoose from 'mongoose';

const causeSchema = new mongoose.Schema(
  {
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    beneficiaryType: {
      type: String,
      enum: ['school', 'shelter', 'rural_community', 'urban_slum', 'other'],
      required: true,
    },
    beneficiaryCount: { type: Number, required: true },
    kitsNeeded: { type: Number, required: true },
    kitsFunded: { type: Number, default: 0 },
    costPerKit: { type: Number, required: true },
    deadline: { type: Date, required: true },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    coverImage: { type: String, default: '' },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'funded', 'expired', 'cancelled'],
      default: 'active',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: how much is still needed
causeSchema.virtual('amountRaised').get(function () {
  return this.kitsFunded * this.costPerKit;
});

causeSchema.virtual('amountNeeded').get(function () {
  return this.kitsNeeded * this.costPerKit;
});

causeSchema.virtual('percentFunded').get(function () {
  if (this.kitsNeeded === 0) return 0;
  return Math.min(100, Math.round((this.kitsFunded / this.kitsNeeded) * 100));
});

causeSchema.set('toJSON', { virtuals: true });
causeSchema.set('toObject', { virtuals: true });

const Cause = mongoose.model('Cause', causeSchema);
export default Cause;
