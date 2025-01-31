import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
  category?: string;
  featured?: boolean;
}

const MenuSection = ({ onAddToCart, category, featured }: MenuSectionProps) => {
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items', category, featured],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (featured) {
        query = query.eq('is_featured', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (price: number) => {
    return `₦${(price * 1000).toLocaleString()}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!menuItems?.length) {
    return <div className="text-gray-500">No items found</div>;
  }

  return (
    <div className="space-y-4">
      {menuItems?.map((item) => (
        <div key={item.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg">
          <div className="w-24 h-24 relative flex-shrink-0">
            <img
              src={item.image_url || '/placeholder.svg'}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{formatPrice(item.price)}</p>
              </div>
              <button
                onClick={() => onAddToCart(item)}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuSection;