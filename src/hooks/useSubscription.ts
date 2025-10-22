import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  loading: boolean;
  error: string | null;
  subscriptionId?: string;
  status?: string;
  currentPeriodEnd?: string;
  planId?: string;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user, isLoading: authLoading } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>({
      hasActiveSubscription: false,
      loading: true,
      error: null,
    });

  useEffect(() => {
    const checkSubscription = async () => {
      if (authLoading || !user?.email) return;

      try {
        setSubscriptionStatus((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        const response = await fetch("/api/user/subscription-status");

        if (!response.ok) {
          throw new Error("Failed to check subscription status");
        }

        const data = await response.json();

        setSubscriptionStatus({
          hasActiveSubscription: data.hasActiveSubscription,
          loading: false,
          error: null,
          subscriptionId: data.subscriptionId,
          status: data.status,
          currentPeriodEnd: data.currentPeriodEnd,
          planId: data.planId,
        });
      } catch (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionStatus({
          hasActiveSubscription: false,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to check subscription",
        });
      }
    };

    checkSubscription();
  }, [user, authLoading]);

  return subscriptionStatus;
};
