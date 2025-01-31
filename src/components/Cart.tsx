import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { useToast } from "@/hooks/use-toast";
import CheckoutForm, { CheckoutFormData } from "./CheckoutForm";
import { supabase } from "@/integrations/supabase/client";

interface CartProps {
  open: boolean;
  onClose: () => void;
}

const Cart = ({ open, onClose }: CartProps) => {
  const { items, removeFromCart, clearCart } = useContext(CartContext);
  const { toast } = useToast();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData>({
    name: "",
    whatsapp: "",
    deliveryType: "pickup",
  });
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const others = 1; // Additional charges
  const deliveryFee = checkoutForm.deliveryType === "delivery" ? 5 : 0;
  const total = subtotal + others + deliveryFee;
  const tax = total * 0.03;
  const finalTotal = total + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price * 1000);
  };

  const handleCheckout = async () => {
    if (!checkoutForm.name || !checkoutForm.whatsapp) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (
      checkoutForm.deliveryType === "delivery" &&
      (!checkoutForm.streetAddress || !checkoutForm.city || !checkoutForm.postalCode)
    ) {
      toast({
        title: "Error",
        description: "Please provide complete delivery address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save order to database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: checkoutForm.name,
            customer_phone: checkoutForm.whatsapp,
            total_amount: finalTotal,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Save order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Format WhatsApp message
      const orderDetails = `
*New Order*
${checkoutForm.deliveryType === "pickup" ? "PICKUP" : "DELIVERY"}

${items
  .map(
    (item) =>
      `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
  )
  .join("\n")}

Order Summary:
Items: ${formatPrice(subtotal)}
Others: ${formatPrice(others)}
${checkoutForm.deliveryType === "delivery" ? `Delivery: ${formatPrice(deliveryFee)}\n` : ""}
Subtotal: ${formatPrice(total)}
Tax (3%): ${formatPrice(tax)}
Total: ${formatPrice(finalTotal)}

Customer Details:
Name: ${checkoutForm.name}
WhatsApp: ${checkoutForm.whatsapp}
Service: ${checkoutForm.deliveryType}
${
  checkoutForm.deliveryType === "delivery"
    ? `
Delivery Address:
${checkoutForm.streetAddress}
${checkoutForm.unitNumber ? checkoutForm.unitNumber + "\n" : ""}
${checkoutForm.city}
${checkoutForm.postalCode}`
    : ""
}`;

      const whatsappLink = `https://wa.me/+1234567890?text=${encodeURIComponent(
        orderDetails
      )}`;
      
      // Clear cart and reset form
      clearCart();
      setCheckoutForm({
        name: "",
        whatsapp: "",
        deliveryType: "pickup",
      });
      setShowCheckoutForm(false);
      onClose();
      
      // Open WhatsApp
      window.open(whatsappLink, "_blank");
      
      toast({
        title: "Order placed successfully",
        description: "You will be redirected to WhatsApp to complete your order.",
      });
    } catch (error: any) {
      console.error("Error processing order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process order",
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] overflow-hidden flex flex-col">
        <DrawerHeader className="flex-none">
          <DrawerTitle>Your Cart</DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {!showCheckoutForm ? (
            // Cart Items View
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-gray-500">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b pb-4"
                    >
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {items.length > 0 && (
                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">{formatPrice(finalTotal)}</span>
                  </div>
                  <Button
                    className="w-full bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 text-black"
                    onClick={() => setShowCheckoutForm(true)}
                  >
                    Checkout
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <CheckoutForm
              formData={checkoutForm}
              onFormChange={(data) =>
                setCheckoutForm((prev) => ({ ...prev, ...data }))
              }
              onSubmit={handleCheckout}
              subtotal={subtotal}
              others={others}
              deliveryFee={deliveryFee}
              total={total}
              tax={tax}
              finalTotal={finalTotal}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;
