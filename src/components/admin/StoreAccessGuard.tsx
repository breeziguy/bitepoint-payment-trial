import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LockIcon } from "lucide-react";
import { useEffect } from "react";

interface StoreAccessGuardProps {
  children: React.ReactNode;
}

export function StoreAccessGuard({ children }: StoreAccessGuardProps) {
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

      if (error) {
        console.error("Error fetching subscription:", error);
        throw error;
      }
      return data;
    },
  });

  // Check if subscription is expired
  const isSubscriptionExpired = !subscription || 
    new Date(subscription.current_period_end) < new Date() || 
    subscription.status !== 'active';

  // Handle renewal navigation
  const handleRenewal = () => {
    navigate("/admin/settings?tab=billing");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isSubscriptionExpired) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <LockIcon className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">Store Access Restricted</DialogTitle>
            <DialogDescription className="text-center">
              Your subscription has expired. Please renew your subscription to regain access to your store.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleRenewal}
              className="w-full sm:w-auto"
            >
              Renew Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
}