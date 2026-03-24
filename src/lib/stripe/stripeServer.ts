import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in env.");
}

export const stripe = new Stripe(secretKey, {
  // Let the Stripe SDK use its default API version.
});

