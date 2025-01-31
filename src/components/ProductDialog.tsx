import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "./CartContext";

interface ProductDialogProps {
  product: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDialog = ({ product, isOpen, onClose }: ProductDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return `₦${(price * 1000).toLocaleString()}`;
  };

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
    });
    onClose();
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="relative h-[300px]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 bg-white/80 backdrop-blur-sm rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <img 
            src={product.image_url || '/placeholder.svg'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="text-2xl text-[#FF9F1C]">{formatPrice(product.price)}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Quantity</h3>
            <div className="flex items-center border rounded-full w-32">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-full"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">{quantity}</div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-r-full"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button 
            className="w-full rounded-full bg-[#075E54] hover:bg-[#075E54]/90 text-white"
            onClick={handleAdd}
          >
            Add {formatPrice(product.price * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDialog;