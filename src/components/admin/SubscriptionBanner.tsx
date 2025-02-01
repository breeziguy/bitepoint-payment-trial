import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SubscriptionBanner() {
  const navigate = useNavigate();

  const { data: subscription } = useQuery({
    queryKey: ["store-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("paystack_email", "mrolabola@gmail.com")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (!subscription) return null;

  const daysUntilExpiry = Math.ceil(
    (new Date(subscription.current_period_end).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry > 7) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0">
      <Timer className="h-4 w-4" />
      <AlertTitle>Subscription Expiring Soon</AlertTitle>
      <div className="flex items-center justify-between">
        <AlertDescription>
          Your subscription will expire in {daysUntilExpiry} days. Please renew to avoid service interruption.
        </AlertDescription>
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin/settings?tab=billing")}
          className="ml-4"
        >
          Renew Now
        </Button>
      </div>
    </Alert>
  );
}