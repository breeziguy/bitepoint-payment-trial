interface OrderSummaryProps {
  subtotal: number;
  others: number;
  deliveryFee: number;
  total: number;
  tax: number;
  finalTotal: number;
  deliveryType: "pickup" | "delivery";
}

const OrderSummary = ({
  subtotal,
  others,
  deliveryFee,
  total,
  tax,
  finalTotal,
  deliveryType,
}: OrderSummaryProps) => {
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h3 className="font-semibold text-lg">Order Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Items</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Others</span>
          <span>{formatPrice(others)}</span>
        </div>
        {deliveryType === "delivery" && (
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium pt-2 border-t">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (3%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;