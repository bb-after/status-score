import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';
import prisma from '../../../lib/prisma';
import { getAuthenticatedUserId } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { priceId } = req.body;
    
    const userId = await getAuthenticatedUserId(req, res);

    if (!priceId || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get or create Stripe customer
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: userId },
    });

    if (!stripeCustomer) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

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

    if (!session.url) {
      return res.status(500).json({ message: 'Failed to create checkout session URL' });
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    
    return res.status(500).json({ 
      message: 'Error creating checkout session',
      error: error.message 
    });
  }
}