import { useContext } from "react";
import { ShoppingCart } from "lucide-react";
import { CartContext } from "./CartContext";

interface FloatingCartBarProps {
  onCartClick: () => void;
}

const FloatingCartBar = ({ onCartClick }: FloatingCartBarProps) => {
  const { items } = useContext(CartContext);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-[#FEF7CD] rounded-full shadow-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5" />
        <span>{totalItems} items</span>
      </div>
      <button
        onClick={onCartClick}
        className="font-semibold"
      >
        View Cart
      </button>
      <span className="font-bold">{formatPrice(totalCost)}</span>
    </div>
  );
};

export default FloatingCartBar;