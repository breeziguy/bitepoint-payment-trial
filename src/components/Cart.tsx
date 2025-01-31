import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

interface CartProps {
  open: boolean;
  onClose: () => void;
}

interface CheckoutForm {
  name: string;
  phone: string;
  deliveryType: "pickup" | "delivery";
  address?: string;
  roomNumber?: string;
}

const Cart = ({ open, onClose }: CartProps) => {
  const { items, removeFromCart } = useContext(CartContext);
  const { toast } = useToast();
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    name: "",
    phone: "",
    deliveryType: "pickup",
  });
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return `₦${(price * 1000).toLocaleString()}`;
  };

  const handleCheckout = () => {
    if (!checkoutForm.name || !checkoutForm.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (checkoutForm.deliveryType === "delivery" && !checkoutForm.address) {
      toast({
        title: "Error",
        description: "Please provide delivery address",
        variant: "destructive",
      });
      return;
    }

    // Format the order message for WhatsApp
    const orderDetails = `
*New Order*
${checkoutForm.deliveryType === "pickup" ? "TAKE15" : "#23"}

${items.map(item => 
  `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
).join('\n')}

Item total: ${formatPrice(total)} (Qty: ${items.reduce((sum, item) => sum + item.quantity, 0)})
Total: ${formatPrice(total)}

Customer: ${checkoutForm.name}
Phone: ${checkoutForm.phone}
Service: ${checkoutForm.deliveryType}
${checkoutForm.deliveryType === "delivery" ? `
Delivery Address / Room number
${checkoutForm.address} ${checkoutForm.roomNumber || ""}` : ""}
    `;
    
    // Create WhatsApp link with pre-filled message
    const whatsappLink = `https://wa.me/+1234567890?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            {items.length === 0 ? (
              <p className="text-center text-gray-500">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
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
          </div>
          
          {items.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Your name"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="Your phone number"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Type</Label>
                  <RadioGroup
                    value={checkoutForm.deliveryType}
                    onValueChange={(value: "pickup" | "delivery") => 
                      setCheckoutForm(prev => ({ ...prev, deliveryType: value }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Pickup</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery">Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>

                {checkoutForm.deliveryType === "delivery" && (
                  <>
                    <div className="space-y-2">
                      <Label>Delivery Address</Label>
                      <Input
                        placeholder="Street address"
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Room Number</Label>
                      <Input
                        placeholder="Room/Unit number (optional)"
                        value={checkoutForm.roomNumber}
                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </div>

              <Button 
                className="w-full bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 text-black"
                onClick={handleCheckout}
              >
                Checkout with WhatsApp
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;