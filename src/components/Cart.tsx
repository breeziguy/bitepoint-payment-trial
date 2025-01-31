import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CartProps {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
  setItems: (items: MenuItem[]) => void;
}

const Cart = ({ open, onClose, items, setItems }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const formatPrice = (price: number) => {
    return `₦${(price * 1000).toLocaleString()}`; // Converting to Naira and formatting
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    // Format the order message for WhatsApp
    const message = `*New Order*\n\n${items.map(item => 
      `• ${item.name} - ${formatPrice(item.price)}`
    ).join('\n')}\n\n*Total: ${formatPrice(total)}*`;
    
    // Create WhatsApp link with pre-filled message
    const whatsappLink = `https://wa.me/+1234567890?text=${encodeURIComponent(message)}`;
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
                      <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <Button 
                className="w-full bg-[#075E54] hover:bg-[#075E54]/90"
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