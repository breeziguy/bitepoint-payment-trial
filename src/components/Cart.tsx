import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useContext, useState, useEffect } from "react";
import { CartContext, CartItem as CartItemType } from "./CartContext";  
import { useToast } from "@/hooks/use-toast";
import CheckoutForm, { CheckoutFormData } from "./CheckoutForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import CartItem from "./CartItem";
import { formatPrice } from "@/utils/formatPrice";
import { generateOrderMessage } from "@/utils/generateOrderMessage";

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
      
      if (error) {
        throw new Error("Unable to load store settings");
      }
      return data;
    },
  });
  
  const calculateItemTotal = (item: CartItemType) => {
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
      (!checkoutForm.streetAddress || !checkoutForm.deliveryZoneId)
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

      const { data: settings, error: settingsError } = await supabase
        .from("store_settings")
        .select("whatsapp_number")
        .limit(1)
        .single();

      if (settingsError || !settings?.whatsapp_number) {
        throw new Error("Store contact information is not available");
      }

      const orderMessage = generateOrderMessage({
        orderId: orderData.id,
        items,
        checkoutForm,
        selectedZoneName,
        subtotal,
        deliveryFee,
        total,
        trackingUrl,
        calculateItemTotal,
      });

      // Clean the phone number and ensure it starts with the country code
      const phoneNumber = settings.whatsapp_number.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderMessage)}`;
      
      clearCart();
      setCheckoutForm({
        name: "",
        whatsapp: "",
        deliveryType: "pickup",
      });
      setShowCheckoutForm(false);
      onClose();
      
      // Open WhatsApp in the same window
      window.location.href = whatsappUrl;
      
      toast({
        title: "Order placed successfully",
        description: "Redirecting to WhatsApp to complete your order...",
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={removeFromCart}
                      calculateItemTotal={calculateItemTotal}
                    />
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