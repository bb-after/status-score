// pages/api/stripe/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '../../../lib/stripe';
import prisma from '../../../lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.upsert({
          where: { subscriptionId: subscription.id },
          create: {
            subscriptionId: subscription.id,
            status: subscription.status,
            planId: subscription.items.data[0].price.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            stripeCustomer: {
              connect: {
                customerId: subscription.customer as string,
              },
            },
          },
          update: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  }
}

export default handler;