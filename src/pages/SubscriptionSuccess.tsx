import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds to billing tab
    const timer = setTimeout(() => {
      navigate("/admin/settings?tab=billing");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Subscription Activated!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for subscribing. Your payment has been processed successfully.
          </p>
          <div className="mt-8 space-y-4">
            <Button
              onClick={() => navigate("/admin/settings?tab=billing")}
              className="w-full"
            >
              Go to Billing Settings
            </Button>
            <Button
              onClick={() => navigate("/admin")}
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            You will be automatically redirected in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}