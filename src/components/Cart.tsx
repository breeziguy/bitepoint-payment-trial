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
  whatsapp: string;
  deliveryType: "pickup" | "delivery";
  streetAddress?: string;
  unitNumber?: string;
  city?: string;
  postalCode?: string;
}

const Cart = ({ open, onClose }: CartProps) => {
  const { items, removeFromCart } = useContext(CartContext);
  const { toast } = useToast();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
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
    return `$${price.toFixed(2)}`;
  };

  const handleCheckout = () => {
    if (!checkoutForm.name || !checkoutForm.whatsapp) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (checkoutForm.deliveryType === "delivery" && 
        (!checkoutForm.streetAddress || !checkoutForm.city || !checkoutForm.postalCode)) {
      toast({
        title: "Error",
        description: "Please provide complete delivery address",
        variant: "destructive",
      });
      return;
    }

    const orderDetails = `
*New Order*
${checkoutForm.deliveryType === "pickup" ? "PICKUP" : "DELIVERY"}

${items.map(item => 
  `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
).join('\n')}

Order Summary:
Items: ${formatPrice(subtotal)}
Others: ${formatPrice(others)}
${checkoutForm.deliveryType === "delivery" ? `Delivery: ${formatPrice(deliveryFee)}\n` : ''}
Subtotal: ${formatPrice(total)}
Tax (3%): ${formatPrice(tax)}
Total: ${formatPrice(finalTotal)}

Customer Details:
Name: ${checkoutForm.name}
WhatsApp: ${checkoutForm.whatsapp}
Service: ${checkoutForm.deliveryType}
${checkoutForm.deliveryType === "delivery" ? `
Delivery Address:
${checkoutForm.streetAddress}
${checkoutForm.unitNumber ? checkoutForm.unitNumber + '\n' : ''}
${checkoutForm.city}
${checkoutForm.postalCode}` : ""}
    `;
    
    const whatsappLink = `https://wa.me/+1234567890?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Your Cart</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4">
          {!showCheckoutForm ? (
            // Cart Items View
            <div className="space-y-4">
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
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
                <div className="space-y-4">
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
            // Checkout Form View
            <div className="space-y-6 animate-in slide-in-from-right">
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
                  <Label>WhatsApp number</Label>
                  <Input
                    placeholder="Your WhatsApp number"
                    value={checkoutForm.whatsapp}
                    onChange={(e) => setCheckoutForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delivery</Label>
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
                      <Label htmlFor="delivery">Home delivery</Label>
                    </div>
                  </RadioGroup>
                </div>

                {checkoutForm.deliveryType === "delivery" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Street address</Label>
                      <Input
                        placeholder="Enter your street address"
                        value={checkoutForm.streetAddress}
                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, streetAddress: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Apartment, unit number, suite, etc. (optional)</Label>
                      <Input
                        placeholder="Unit number (optional)"
                        value={checkoutForm.unitNumber}
                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, unitNumber: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        placeholder="Enter city"
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postal code</Label>
                      <Input
                        placeholder="Enter postal code"
                        value={checkoutForm.postalCode}
                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-lg">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items ({items.length})</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Others</span>
                      <span>{formatPrice(others)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
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
              </div>

              <Button 
                className="w-full bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 text-black"
                onClick={handleCheckout}
              >
                Make Payment
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;