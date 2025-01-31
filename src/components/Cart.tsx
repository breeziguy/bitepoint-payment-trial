import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { CartContext, CartItem } from "./CartContext";  
import { useToast } from "@/hooks/use-toast";
import CheckoutForm, { CheckoutFormData } from "./CheckoutForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const [selectedZonePrice, setSelectedZonePrice] = useState(0);
  const [selectedZoneName, setSelectedZoneName] = useState("");

  const { data: storeSettings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("whatsapp_number")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });
  
  const calculateItemTotal = (item: CartItem) => {
    let itemTotal = item.price * item.quantity;
    if (item.addons) {
      itemTotal += item.addons.reduce((sum, addon) => sum + (addon.price * item.quantity), 0);
    }
    return itemTotal;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const deliveryFee = checkoutForm.deliveryType === "delivery" ? selectedZonePrice : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (checkoutForm.deliveryZoneId) {
      const fetchZoneDetails = async () => {
        const { data } = await supabase
          .from("delivery_zones")
          .select("price, name")
          .eq("id", checkoutForm.deliveryZoneId)
          .single();
        if (data) {
          setSelectedZonePrice(data.price);
          setSelectedZoneName(data.name);
        }
      };
      fetchZoneDetails();
    } else {
      setSelectedZonePrice(0);
      setSelectedZoneName("");
    }
  }, [checkoutForm.deliveryZoneId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
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
      (!checkoutForm.streetAddress || !checkoutForm.city || !checkoutForm.postalCode || !checkoutForm.deliveryZoneId)
    ) {
      toast({
        title: "Error",
        description: "Please provide complete delivery information",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: checkoutForm.name,
            customer_phone: checkoutForm.whatsapp,
            total_amount: total,
            status: "pending",
            delivery_zone_id: checkoutForm.deliveryZoneId,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        notes: item.addons ? `Add-ons: ${item.addons.map(addon => addon.name).join(', ')}` : null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const { data: trackingData, error: trackingError } = await supabase
        .from("order_tracking")
        .insert([{ order_id: orderData.id }])
        .select()
        .single();

      if (trackingError) throw trackingError;

      const trackingUrl = `${window.location.origin}/track/${trackingData.tracking_token}`;

      const orderDetails = `
*New Order #${orderData.id.slice(0, 8)}*
> ${checkoutForm.deliveryType === "pickup" ? "*PICKUP*" : `*DELIVERY - ${selectedZoneName}*`}

${items
  .map(
    (item) =>
      `\`${item.quantity}x ${item.name} - ${formatPrice(calculateItemTotal(item))}\`${
        item.addons && item.addons.length > 0
          ? `\n${item.addons.map((addon) => `  + ${addon.name}`).join("\n")}`
          : ""
      }`
  )
  .join("\n")}

> Order Summary:
Items: ${formatPrice(subtotal)}
${checkoutForm.deliveryType === "delivery" ? `Delivery (${selectedZoneName}): ${formatPrice(deliveryFee)}\n` : ""}
*Total: ${formatPrice(total)}*

> Customer Details:
Name: ${checkoutForm.name}
WhatsApp: ${checkoutForm.whatsapp}
Service: ${checkoutForm.deliveryType}

${
  checkoutForm.deliveryType === "delivery"
    ? `> Delivery Address:
${checkoutForm.streetAddress}
${checkoutForm.unitNumber ? `${checkoutForm.unitNumber}\n` : ""}${checkoutForm.city}
${checkoutForm.postalCode}
Zone: ${selectedZoneName}`
    : ""
}

> Track Your Order:
${trackingUrl}`;

      const whatsappNumber = storeSettings?.whatsapp_number || "+1234567890";
      const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent(
        orderDetails
      )}`;
      
      clearCart();
      setCheckoutForm({
        name: "",
        whatsapp: "",
        deliveryType: "pickup",
      });
      setShowCheckoutForm(false);
      onClose();
      
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
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-gray-500">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start border-b pb-4"
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                        {item.addons && item.addons.length > 0 && (
                          <div className="text-sm text-gray-500">
                            <p className="font-medium">Add-ons:</p>
                            {item.addons.map((addon) => (
                              <p key={addon.id}>
                                + {addon.name} ({formatPrice(addon.price)})
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="text-sm font-medium">
                          Item Total: {formatPrice(calculateItemTotal(item))}
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
                    <span className="font-medium">{formatPrice(total)}</span>
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
              deliveryFee={deliveryFee}
              total={total}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;