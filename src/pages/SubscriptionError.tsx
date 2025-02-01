import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionError() {
  const location = useLocation();
  const error = location.state?.error || "An error occurred during payment processing";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Payment Failed</h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
        </div>
        <div className="mt-8 space-y-4">
          <Button asChild className="w-full">
            <Link to="/admin/settings">
              Return to Settings
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/admin">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}