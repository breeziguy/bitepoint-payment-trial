import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProductDialogProps {
  product: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDialog = ({ product, isOpen, onClose }: ProductDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const { addToCart } = useContext(CartContext);

  const { data: addons } = useQuery({
    queryKey: ['product-addons', product.id],
    queryFn: async () => {
      const { data: menuAddons, error: menuAddonsError } = await supabase
        .from('menu_addons')
        .select('addon_item_id')
        .eq('menu_item_id', product.id);

      if (menuAddonsError) throw menuAddonsError;

      if (!menuAddons?.length) return [];

      const addonIds = menuAddons.map(item => item.addon_item_id);
      
      const { data: addonItems, error: addonItemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', addonIds);

      if (addonItemsError) throw addonItemsError;
      return addonItems || [];
    },
    enabled: isOpen && !!product.id,
  });

  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const calculateTotal = () => {
    let total = product.price * quantity;
    if (addons) {
      addons.forEach(addon => {
        if (selectedAddons.includes(addon.id)) {
          total += addon.price * quantity; // Multiply addon price by quantity
        }
      });
    }
    return total;
  };

  const handleAdd = () => {
    const selectedAddonItems = addons?.filter(addon => 
      selectedAddons.includes(addon.id)
    ).map(addon => ({
      id: addon.id,
      name: addon.name,
      price: addon.price
    })) || [];

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      description: product.description,
      category: product.category,
      image: product.image_url,
      addons: selectedAddonItems
    });
    
    onClose();
    setQuantity(1);
    setSelectedAddons([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

          {product.description && (
            <p className="text-gray-600">{product.description}</p>
          )}

          {addons && addons.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Available Add-ons</h3>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddons([...selectedAddons, addon.id]);
                          } else {
                            setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                          }
                        }}
                      />
                      <Label htmlFor={`addon-${addon.id}`}>{addon.name}</Label>
                    </div>
                    <span className="text-[#FF9F1C]">{formatPrice(addon.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            Add {formatPrice(calculateTotal())}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDialog;