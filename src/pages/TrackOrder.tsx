import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function TrackOrder() {
  const { token } = useParams();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ["order", token],
    queryFn: async () => {
      const { data: trackingData, error: trackingError } = await supabase
        .from("order_tracking")
        .select("order_id")
        .eq("tracking_token", token)
        .single();

      if (trackingError) throw trackingError;

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq("id", trackingData.order_id)
        .single();

      if (orderError) throw orderError;
      return orderData;
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>
              The order tracking link may be invalid or expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Order #{orderData.id.slice(0, 8)}</CardTitle>
          <CardDescription>
            Placed on{" "}
            {new Date(orderData.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Order Status</h3>
            <div className="flex gap-2">
              <Badge variant={orderData.payment_status === "paid" ? "default" : "secondary"}>
                Payment: {orderData.payment_status}
              </Badge>
              <Badge variant={orderData.delivery_status === "delivered" ? "default" : "secondary"}>
                Delivery: {orderData.delivery_status}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-2">
              {orderData.order_items.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.menu_items.name}
                  </span>
                  <span className="text-gray-600">
                    {formatPrice(item.price_at_time * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>{formatPrice(orderData.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}