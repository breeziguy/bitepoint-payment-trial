interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: "pickup" | "delivery";
}

const OrderSummary = ({
  subtotal,
  deliveryFee,
  total,
  deliveryType,
}: OrderSummaryProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h3 className="font-semibold text-lg">Order Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Items</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {deliveryType === "delivery" && (
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold pt-2 border-t">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;