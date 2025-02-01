import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function StoreAccessGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  const { data: subscription, isLoading } = useQuery({
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

  const isExpired = subscription && new Date(subscription.current_period_end) < new Date();

  if (isLoading) return children;

  if (isExpired) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Store Access Restricted</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Your store is currently inactive due to an expired subscription. Please renew your subscription to continue using the store.</p>
            <Button 
              onClick={() => navigate("/admin/settings?tab=billing")}
              className="w-full"
            >
              Renew Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return children;
}