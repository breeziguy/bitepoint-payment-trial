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

const ADDON_CATEGORIES = [
  { value: 'protein', label: 'Protein Options' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'extras', label: 'Extra Toppings' },
  { value: 'packs', label: 'Food Packs' },
];

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

      // Pre-select required addons
      const requiredAddons = (addonItems || []).filter(addon => addon.is_required);
      if (requiredAddons.length > 0) {
        setSelectedAddons(prev => [
          ...prev,
          ...requiredAddons.map(addon => addon.id)
        ]);
      }

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
          total += addon.price * quantity;
        }
      });
    }
    return total;
  };

  const groupedAddons = addons?.reduce((acc, addon) => {
    const category = addon.addon_category || 'others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(addon);
    return acc;
  }, {} as Record<string, typeof addons>);

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

  const getCategoryLabel = (category: string) => {
    return ADDON_CATEGORIES.find(cat => cat.value === category)?.label || 'Other Options';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-[300px] md:h-full">
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
              className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            />
          </div>
          
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold">{product.name}</h2>
              <p className="text-2xl text-[#FF9F1C]">{formatPrice(product.price)}</p>
            </div>

            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}

            {groupedAddons && Object.entries(groupedAddons).length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupedAddons).map(([category, categoryAddons]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="font-semibold">{getCategoryLabel(category)}</h3>
                    <div className="space-y-2">
                      {categoryAddons.map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`addon-${addon.id}`}
                              checked={selectedAddons.includes(addon.id)}
                              onCheckedChange={(checked) => {
                                if (addon.is_required) return;
                                if (checked) {
                                  setSelectedAddons([...selectedAddons, addon.id]);
                                } else {
                                  setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                                }
                              }}
                              disabled={addon.is_required}
                            />
                            <div>
                              <Label htmlFor={`addon-${addon.id}`} className="flex items-center space-x-2">
                                {addon.name}
                                {addon.is_required && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded ml-2">
                                    Required
                                  </span>
                                )}
                              </Label>
                            </div>
                          </div>
                          <span className="text-[#FF9F1C]">{formatPrice(addon.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
    </div>
  );
};

export default ProductDialog;
