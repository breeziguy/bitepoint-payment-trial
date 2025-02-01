import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Subscription Successful",
      description: "Your subscription has been processed successfully.",
    });
    
    // Redirect to billing tab after a short delay
    const timer = setTimeout(() => {
      navigate("/admin/settings?tab=billing", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
        <p>Redirecting you to the billing dashboard...</p>
      </div>
    </div>
  );
}