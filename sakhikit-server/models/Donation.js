import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    amount: { type: Number, required: true },
    kitsCount: { type: Number, required: true },
    isRecurring: { type: Boolean, default: false },
    stripePaymentIntentId: { type: String },
    stripeSubscriptionId: { type: String },
    stripeCustomerId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    message: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
