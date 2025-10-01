import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCardIcon, SpinnerIcon } from '../components/icons';

// This simulates calling our backend function. In a real app, this would be an API call,
// for example: `await fetch('/api/create-checkout-session')`.
async function fetchCheckoutSession() {
  // For demonstration purposes, we return a mock session ID.
  // Stripe's test mode recognizes the "cs_test_..." format and shows a valid test checkout page.
  // This allows the frontend to be fully interactive without a live backend.
  return { id: 'cs_test_a1h2x0gS1s6j2N2wA1lS4wG3i8J2d2d7s3d3f9bV0o4o2j2n4s3s1s2s1' };
}

// Replace with your actual Stripe publishable key.
// It's safe to expose this in frontend code.
const stripePromise = loadStripe('pk_test_51LoeTbL3Tqf4x0gS1s6j2N2wA1lS4wG3i8J2d2d7s3d3f9bV0o4o2j2n4s3s1s2s1');

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch the checkout session ID from your backend
      // Fix: Updated destructuring to match the return type of `fetchCheckoutSession`.
      // The function returns an object with only an `id` property, so destructuring an `error` property was incorrect.
      const { id: sessionId } = await fetchCheckoutSession();

      // 2. Load the Stripe.js script
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js has not loaded yet.');
      }

      // 3. Redirect to the Stripe-hosted checkout page
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      // This point will only be reached if there is an immediate error when
      // redirecting (e.g., a network error).
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Payment Error:', errorMessage);
      setError('Failed to initiate payment. Please try again.');
      setLoading(false); // Only reset loading state if an error occurs before redirect
    }
  };


  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-2">Suvo Pro</h1>
        <p className="text-zinc-400 text-center mb-6">Unlock all features and build faster.</p>
        
        <div className="text-center my-8">
          <span className="text-5xl font-extrabold text-white">$25</span>
          <span className="text-zinc-400">/month</span>
        </div>

        <button
          onClick={handleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 font-semibold bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? (
            <>
              <SpinnerIcon className="w-5 h-5" />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <CreditCardIcon className="w-5 h-5" />
              <span>Upgrade to Pro</span>
            </>
          )}
        </button>
        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default App;