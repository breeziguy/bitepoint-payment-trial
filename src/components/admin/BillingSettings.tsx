import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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

const featureDescriptions: Record<string, string> = {
  menu_items: "Menu Items Limit",
  support: "Support Level",
  whatsapp_integration: "WhatsApp Integration",
  custom_domain: "Custom Domain",
  pos_integration: "POS Integration",
  priority_support: "Priority Support",
  advanced_analytics: "Advanced Analytics",
  multi_location: "Multi-location Support",
  custom_design: "Custom Design",
  online_payments: "Online Payments",
  ai_automated_orders: "AI Automated Orders",
  staff_management: "Staff Management",
  inventory_management: "Inventory Management",
  api_access: "API Access"
};

export default function BillingSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
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
      
      sessionStorage.setItem('pending_subscription_plan', plan.id);
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Payment initialization error:', error);
      navigate('/subscription/error', {
        state: { error: 'Failed to initialize subscription' }
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
            <div className="space-y-4">
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
          <Card key={plan.id} className={cn(
            "relative",
            plan.name === "Professional Plan" && "border-primary shadow-lg"
          )}>
            {plan.name === "Professional Plan" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div className="text-3xl font-bold">₦{plan.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.features && Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{featureDescriptions[key] || key}: </span>
                      <span>{value === true ? "Yes" : value}</span>
                    </div>
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