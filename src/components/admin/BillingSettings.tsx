import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: Record<string, any> | null;
}

interface StoreSubscription {
  id: string;
  plan_id: string | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  paystack_email: string;
  paystack_subscription_code: string | null;
}

export default function BillingSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch subscription data
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["store-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_subscriptions")
        .select("*")
        .eq("paystack_email", "mrolabola@gmail.com")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data as StoreSubscription | null;
    },
  });

  // Fetch plans data
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price");
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Handle subscription initiation
  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      // Double-check subscription status before proceeding
      const { data: activeSubscription, error: subscriptionError } = await supabase
        .from("store_subscriptions")
        .select("*")
        .eq("paystack_email", "mrolabola@gmail.com")
        .eq("status", "active")
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error checking subscription status:', subscriptionError);
        throw subscriptionError;
      }

      if (activeSubscription) {
        toast({
          title: "Subscription Exists",
          description: "You already have an active subscription. Please cancel your current subscription before subscribing to a new plan.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('paystack', {
        body: {
          plan_id: plan.id,
          amount: plan.price,
        },
      });

      if (response.error) {
        console.error('Payment initialization error:', response.error);
        navigate('/subscription/error', { 
          state: { error: response.error.message }
        });
        return;
      }

      if (!response.data || !response.data.authorization_url) {
        console.error('Invalid response data:', response.data);
        navigate('/subscription/error', {
          state: { error: 'Failed to get payment authorization URL' }
        });
        return;
      }

      // Store the plan ID in session storage to verify after payment
      sessionStorage.setItem('pending_subscription_plan', plan.id);
      
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Payment initialization error:', error);
      navigate('/subscription/error', {
        state: { error: 'Failed to initialize subscription' }
      });
    }
  };

  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = subscription && (
    new Date(subscription.current_period_end).getTime() - new Date().getTime()
  ) / (1000 * 60 * 60 * 24) <= 7;

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isExpiringSoon && (
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Subscription Expiring Soon</AlertTitle>
                  <AlertDescription>
                    Your subscription will expire on {new Date(subscription.current_period_end).toLocaleDateString()}. 
                    Please renew to avoid service interruption. For bank transfer payments, please contact support.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                </div>
                {subscription.plan_id && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Plan</span>
                    <span>{plans?.find(p => p.id === subscription.plan_id)?.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current Period</span>
                  <span>
                    {new Date(subscription.current_period_start).toLocaleDateString()} -{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{(plan.price / 100).toLocaleString()}</div>
              <div className="mt-4 space-y-2">
                {plan.features && Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan)}
                disabled={!!subscription}
                variant={subscription?.plan_id === plan.id ? "secondary" : "default"}
              >
                {subscription?.plan_id === plan.id
                  ? "Current Plan"
                  : subscription
                  ? "Cancel Current Plan First"
                  : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}