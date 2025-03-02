
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Loader } from "lucide-react";

interface CartProps {
  open: boolean;
  onClose: () => void;
}

interface PaymentDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
  orderId: string;
  reference: string;
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
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

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

  // Poll for payment status
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (orderId && showPaymentDialog) {
      intervalId = window.setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("payment_status")
            .eq("id", orderId)
            .single();
            
          if (error) throw error;
          
          if (data && data.payment_status === "paid") {
            // Payment confirmed
            clearInterval(intervalId);
            setShowPaymentDialog(false);
            
            toast({
              title: "Payment Successful!",
              description: "Your order has been confirmed.",
            });
            
            clearCart();
            setCheckoutForm({
              name: "",
              whatsapp: "",
              deliveryType: "pickup",
            });
            setShowCheckoutForm(false);
            onClose();
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, showPaymentDialog, clearCart, onClose, toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Account number copied to clipboard",
      });
    });
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
      (!checkoutForm.streetAddress || !checkoutForm.deliveryZoneId)
    ) {
      toast({
        title: "Error",
        description: "Please provide complete delivery information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Step 1: Create order with initial status
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: checkoutForm.name,
            customer_phone: checkoutForm.whatsapp,
            total_amount: total,
            status: "pending",
            payment_status: "pending",
            delivery_status: "pending",
            delivery_zone_id: checkoutForm.deliveryZoneId,
            delivery_address: checkoutForm.streetAddress 
              ? `${checkoutForm.streetAddress}${checkoutForm.unitNumber ? ', ' + checkoutForm.unitNumber : ''}`
              : null,
            delivery_type: checkoutForm.deliveryType,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;
      setOrderId(orderData.id);

      // Step 2: Add order items
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

      // Step 3: Create tracking record
      const { data: trackingData, error: trackingError } = await supabase
        .from("order_tracking")
        .insert([{ order_id: orderData.id }])
        .select()
        .single();

      if (trackingError) throw trackingError;

      // Step 4: Initialize Flutterwave payment
      const response = await supabase.functions.invoke('flutterwave', {
        body: {
          amount: total,
          customer_name: checkoutForm.name,
          customer_phone: checkoutForm.whatsapp,
          order_id: orderData.id
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Payment initialization failed');
      }

      // Set payment details and show dialog
      setPaymentDetails({
        accountNumber: response.data.account_number,
        accountName: response.data.account_name,
        bankName: response.data.bank_name,
        amount: response.data.amount,
        orderId: response.data.order_id,
        reference: response.data.reference
      });
      
      setShowPaymentDialog(true);
      setIsProcessingPayment(false);
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessingPayment(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Transfer</DialogTitle>
            <DialogDescription>
              Please transfer exactly {formatPrice(paymentDetails?.amount || 0)} to the account below.
            </DialogDescription>
          </DialogHeader>
          
          {paymentDetails && (
            <div className="space-y-4 mt-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{paymentDetails.accountNumber}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => copyToClipboard(paymentDetails.accountNumber)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Bank Name</span>
                  <span>{paymentDetails.bankName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Account Name</span>
                  <span>{paymentDetails.accountName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="font-bold">{formatPrice(paymentDetails.amount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Reference</span>
                  <span className="text-xs">{paymentDetails.reference}</span>
                </div>
              </div>
              
              <div className="flex justify-center items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Waiting for payment confirmation...</span>
                </div>
              </div>
              
              <div className="text-xs text-center text-gray-500 mt-4">
                Your order will be confirmed automatically once your payment is received. 
                Please do not close this window until your payment is confirmed.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin mb-4" />
            <p>Processing your order...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
