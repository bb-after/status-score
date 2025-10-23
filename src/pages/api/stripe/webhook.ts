// pages/api/stripe/webhook.ts
import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import prisma from "../../../lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.created":
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Error processing webhook" });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log(
    `Processing subscription ${subscription.status}: ${subscription.id}`,
  );

  // Find the Stripe customer
  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { customerId: subscription.customer as string },
  });

  if (!stripeCustomer) {
    console.error(`Stripe customer not found: ${subscription.customer}`);
    return;
  }

  await prisma.subscription.upsert({
    where: { subscriptionId: subscription.id },
    create: {
      subscriptionId: subscription.id,
      status: subscription.status,
      planId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeCustomerId: stripeCustomer.id,
    },
    update: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      planId: subscription.items.data[0].price.id,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Processing subscription deletion: ${subscription.id}`);

  await prisma.subscription.update({
    where: { subscriptionId: subscription.id },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: false,
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);

  if (invoice.subscription) {
    // Update subscription status to active if payment succeeded
    await prisma.subscription.updateMany({
      where: { subscriptionId: invoice.subscription as string },
      data: { status: "active" },
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice: ${invoice.id}`);

  if (invoice.subscription) {
    // Update subscription status to past_due if payment failed
    await prisma.subscription.updateMany({
      where: { subscriptionId: invoice.subscription as string },
      data: { status: "past_due" },
    });
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`Customer created: ${customer.id}`);

  // Find user by email if provided
  if (customer.email) {
    const user = await prisma.user.findUnique({
      where: { email: customer.email },
    });

    if (user) {
      await prisma.stripeCustomer.upsert({
        where: { customerId: customer.id },
        create: {
          userId: user.id,
          customerId: customer.id,
        },
        update: {
          userId: user.id,
        },
      });
    }
  }
}

export default handler;
