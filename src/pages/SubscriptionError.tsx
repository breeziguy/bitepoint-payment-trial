import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SubscriptionError() {
  const location = useLocation();
  const error = location.state?.error || "An error occurred during payment processing";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Payment Failed</h2>
          
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <p className="mt-4 text-sm text-gray-600">
            Your subscription could not be processed. This might be due to:
          </p>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
            <li>Insufficient funds</li>
            <li>Card declined</li>
            <li>Invalid payment details</li>
          </ul>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button asChild className="w-full">
            <Link to="/admin/settings?tab=billing">
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/admin">
              Go to Dashboard
            </Link>
          </Button>
          <p className="text-center text-sm text-gray-500">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}