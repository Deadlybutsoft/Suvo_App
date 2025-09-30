// IMPORTANT: This file simulates a server-side function.
// In a real application, this code would run on a secure backend (e.g., a serverless function)
// and would NOT be exposed to the client.

// The 'stripe' package is a Node.js library and should be used on the server.
import Stripe from 'stripe';

// This is your Stripe secret key. It MUST be kept secret and stored as an environment variable on your server.
// DO NOT expose this key in your frontend code.
// Replace with your actual Stripe secret key.
const stripe = new Stripe('sk_test_51LoeTbL3Tqf4x0gSgD5a0g5h1j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3', {
  apiVersion: '2024-04-10',
});

// This function would be your API endpoint that the frontend calls.
export async function createCheckoutSession() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Suvo Pro Plan',
              images: ['https://res.cloudinary.com/dkvkxermy/image/upload/v1759208215/4ae33681-e73e-4569-993c-ff9cef5e8baa_pdsy8o.webp'],
            },
            unit_amount: 2500, // Amount in cents ($25.00)
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${window.location.origin}?success=true`,
      cancel_url: `${window.location.origin}?canceled=true`,
    });

    // In a real backend, you would return this session object or just its ID to the client.
    return { id: session.id };
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    // In a real backend, you would return an appropriate error response.
    return { error: (error as Error).message };
  }
}
