import prisma from "../lib/prisma";

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionId?: string;
  status?: string;
  currentPeriodEnd?: Date;
  planId?: string;
}

export async function getUserSubscriptionStatus(
  userId: number,
): Promise<SubscriptionStatus> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stripeCustomer: {
          include: {
            subscriptions: {
              where: {
                status: {
                  in: ["active", "trialing"],
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!user?.stripeCustomer?.subscriptions?.length) {
      return { hasActiveSubscription: false };
    }

    const subscription = user.stripeCustomer.subscriptions[0];

    return {
      hasActiveSubscription: true,
      subscriptionId: subscription.subscriptionId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      planId: subscription.planId,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { hasActiveSubscription: false };
  }
}

export async function getUserSubscriptionStatusByEmail(
  email: string,
): Promise<SubscriptionStatus> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        stripeCustomer: {
          include: {
            subscriptions: {
              where: {
                status: {
                  in: ["active", "trialing"],
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!user?.stripeCustomer?.subscriptions?.length) {
      return { hasActiveSubscription: false };
    }

    const subscription = user.stripeCustomer.subscriptions[0];

    return {
      hasActiveSubscription: true,
      subscriptionId: subscription.subscriptionId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      planId: subscription.planId,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { hasActiveSubscription: false };
  }
}
