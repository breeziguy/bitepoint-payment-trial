import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "./CartContext";
import { formatPrice } from "@/utils/formatPrice";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  calculateItemTotal: (item: CartItemType) => number;
}

const CartItem = ({ item, onRemove, calculateItemTotal }: CartItemProps) => {
  return (
    <div className="flex justify-between items-start border-b pb-4">
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
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CartItem;