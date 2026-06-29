import Stripe from 'stripe';
import Donation from '../models/Donation.js';
import Cause from '../models/Cause.js';
import NGO from '../models/NGO.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// POST /api/donations/create-payment-intent
// One-time donation
export const createPaymentIntent = async (req, res) => {
  try {
    const { causeId, kitsCount, message, isAnonymous } = req.body;

    const cause = await Cause.findById(causeId).populate('ngoId');
    if (!cause) return res.status(404).json({ message: 'Cause not found' });
    if (cause.status !== 'active') return res.status(400).json({ message: 'Cause is not active' });

    const amount = kitsCount * cause.costPerKit;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses paise
      currency: 'inr',
      metadata: {
        causeId: causeId.toString(),
        ngoId: cause.ngoId._id.toString(),
        donorId: req.dbUser._id.toString(),
        kitsCount: kitsCount.toString(),
      },
    });

    // Create pending donation record
    const donation = await Donation.create({
      donorId: req.dbUser._id,
      causeId,
      ngoId: cause.ngoId._id,
      amount,
      kitsCount,
      isRecurring: false,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      message: message || '',
      isAnonymous: isAnonymous || false,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      donationId: donation._id,
      amount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
};

// POST /api/donations/create-subscription
// Recurring monthly donation
export const createSubscription = async (req, res) => {
  try {
    const { causeId, kitsCount, message, isAnonymous } = req.body;

    const cause = await Cause.findById(causeId).populate('ngoId');
    if (!cause) return res.status(404).json({ message: 'Cause not found' });

    const amount = kitsCount * cause.costPerKit;

    // Create or retrieve Stripe customer
    let customerId = req.dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.dbUser.email,
        name: req.dbUser.name,
        metadata: { userId: req.dbUser._id.toString() },
      });
      customerId = customer.id;
    }

    // Create a price on the fly for this amount
    const price = await stripe.prices.create({
      unit_amount: amount * 100,
      currency: 'inr',
      recurring: { interval: 'month' },
      product_data: { name: `Monthly donation - ${cause.title}` },
    });

    // Create subscription with incomplete status (needs payment method)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        causeId: causeId.toString(),
        ngoId: cause.ngoId._id.toString(),
        donorId: req.dbUser._id.toString(),
        kitsCount: kitsCount.toString(),
      },
    });

    const donation = await Donation.create({
      donorId: req.dbUser._id,
      causeId,
      ngoId: cause.ngoId._id,
      amount,
      kitsCount,
      isRecurring: true,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      status: 'pending',
      message: message || '',
      isAnonymous: isAnonymous || false,
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      donationId: donation._id,
      amount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subscription', error: error.message });
  }
};

// POST /api/donations/webhook
// Stripe webhook — confirms payments
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const donation = await Donation.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: 'completed', receiptUrl: pi.charges?.data[0]?.receipt_url },
          { new: true }
        );
        if (donation) {
          await Cause.findByIdAndUpdate(donation.causeId, {
            $inc: { kitsFunded: donation.kitsCount },
          });
          // Check if cause is now fully funded
          const cause = await Cause.findById(donation.causeId);
          if (cause && cause.kitsFunded >= cause.kitsNeeded) {
            await Cause.findByIdAndUpdate(donation.causeId, { status: 'funded' });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        await Donation.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: 'failed' }
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const donation = await Donation.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription },
            { status: 'completed' },
            { new: true }
          );
          if (donation) {
            await Cause.findByIdAndUpdate(donation.causeId, {
              $inc: { kitsFunded: donation.kitsCount },
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await Donation.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { status: 'cancelled' }
        );
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// GET /api/donations/my
// Donor's donation history
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.dbUser._id })
      .populate('causeId', 'title coverImage location')
      .populate('ngoId', 'name')
      .sort({ createdAt: -1 });
    res.json({ count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch donations', error: error.message });
  }
};
