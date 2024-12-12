// pages/api/stripe/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { priceId, userId } = req.body;

    // Get or create Stripe customer
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: userId },
    });

    if (!stripeCustomer) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id.toString() },
      });

      stripeCustomer = await prisma.stripeCustomer.create({
        data: {
          userId: user.id,
          customerId: customer.id,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
}