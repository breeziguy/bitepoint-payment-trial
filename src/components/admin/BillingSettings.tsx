import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Check for Paystack transaction status on component mount
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated successfully.",
      });
      // Refresh subscription data
      queryClient.invalidateQueries({ queryKey: ["store-subscription"] });
    }
  }, [searchParams, toast, queryClient]);

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

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["store-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_subscriptions")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data as StoreSubscription | null;
    },
  });

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      console.log('Initializing payment for plan:', plan);
      
      const response = await supabase.functions.invoke('paystack', {
        body: {
          plan_id: plan.id,
          amount: plan.price,
        },
      });

      console.log('Paystack function response:', response);

      if (response.error) {
        console.error('Payment initialization error:', response.error);
        throw new Error(response.error.message);
      }

      if (!response.data || !response.data.authorization_url) {
        console.error('Invalid response data:', response.data);
        throw new Error('Failed to get payment authorization URL');
      }

      // Redirect to Paystack checkout
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                disabled={subscription?.status === "active" && subscription?.plan_id === plan.id}
              >
                {subscription?.status === "active" && subscription?.plan_id === plan.id
                  ? "Current Plan"
                  : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}