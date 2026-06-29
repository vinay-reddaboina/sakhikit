import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../../lib/stripe';
import { useApi } from '../../lib/useApi';
import { useAuth0 } from '@auth0/auth0-react';

function CheckoutForm({ donationId, amount, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/causes` },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-sakhi-50 rounded-lg p-4 text-center mb-4">
        <p className="text-sm text-gray-600">Total amount</p>
        <p className="text-3xl font-bold text-sakhi-900">₹{amount}</p>
      </div>

      <PaymentElement />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-sakhi-700 text-white py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>

      <button type="button" onClick={onClose}
        className="w-full text-gray-500 text-sm hover:text-gray-700 transition">
        Cancel
      </button>
    </form>
  );
}

export default function DonationModal({ cause, onClose }) {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { createPaymentIntent, createSubscription } = useApi();
  const [step, setStep] = useState('configure');
  const [kitsCount, setKitsCount] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [donationId, setDonationId] = useState(null);
  const [amount, setAmount] = useState(cause.costPerKit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleKitsChange = (val) => {
    const n = Math.max(1, Math.min(val, cause.kitsNeeded - cause.kitsFunded));
    setKitsCount(n);
    setAmount(n * cause.costPerKit);
  };

  const handleProceed = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fn = isRecurring ? createSubscription : createPaymentIntent;
      const res = await fn({ causeId: cause._id, kitsCount, message, isAnonymous });
      setClientSecret(res.clientSecret);
      setDonationId(res.donationId);
      setStep('payment');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-sakhi-900 mb-2">Thank you!</h3>
          <p className="text-gray-600 mb-2">
            You just sponsored <strong>{kitsCount} kit{kitsCount > 1 ? 's' : ''}</strong>.
          </p>
          <p className="text-sakhi-700 text-sm mb-6">
            {kitsCount} girl{kitsCount > 1 ? 's' : ''} will stay in school this month.
          </p>
          <button onClick={onClose}
            className="bg-sakhi-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition">
            Close
          </button>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-xl font-bold text-sakhi-900 mb-1">Sponsor a Kit</h3>
      <p className="text-gray-500 text-sm mb-6 line-clamp-1">{cause.title}</p>

      {step === 'configure' && (
        <div className="space-y-5">
          {/* Kit count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many kits? (₹{cause.costPerKit} each)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleKitsChange(kitsCount - 1)}
                className="w-10 h-10 rounded-full border border-sakhi-200 text-sakhi-700 font-bold hover:bg-sakhi-50 transition"
              >−</button>
              <input
                type="number"
                value={kitsCount}
                onChange={(e) => handleKitsChange(Number(e.target.value))}
                min={1}
                className="w-20 text-center border border-gray-200 rounded-lg py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sakhi-300"
              />
              <button
                onClick={() => handleKitsChange(kitsCount + 1)}
                className="w-10 h-10 rounded-full border border-sakhi-200 text-sakhi-700 font-bold hover:bg-sakhi-50 transition"
              >+</button>
              <span className="text-sakhi-700 font-bold text-xl ml-2">= ₹{amount}</span>
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between p-4 bg-sakhi-50 rounded-lg border border-sakhi-100">
            <div>
              <p className="font-medium text-sakhi-900 text-sm">Make it monthly</p>
              <p className="text-xs text-gray-500">Automatically donate every month</p>
            </div>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-12 h-6 rounded-full transition-colors ${isRecurring ? 'bg-sakhi-700' : 'bg-gray-200'}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message of support..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sakhi-300"
            />
          </div>

          {/* Anonymous */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-sakhi-700"
            />
            <span className="text-sm text-gray-600">Donate anonymously</span>
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleProceed}
            disabled={loading}
            className="w-full bg-sakhi-700 text-white py-3 rounded-lg font-semibold hover:bg-sakhi-900 transition disabled:opacity-50"
          >
            {loading ? 'Setting up...' : isAuthenticated ? `Proceed to Pay ₹${amount}` : 'Log in to Donate'}
          </button>
        </div>
      )}

      {step === 'payment' && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            donationId={donationId}
            amount={amount}
            onSuccess={() => setSuccess(true)}
            onClose={onClose}
          />
        </Elements>
      )}
    </ModalWrapper>
  );
}

function ModalWrapper({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
