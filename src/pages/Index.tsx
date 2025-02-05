import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import { CartProvider, CartContext } from "@/components/CartContext";
import ProductDialog from "@/components/ProductDialog";
import FloatingCartBar from "@/components/FloatingCartBar";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: storeSettings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold">{storeSettings?.store_name || 'Food Frenzy'}</h1>
            <div className="flex items-center gap-4">
              {import.meta.env.DEV && (
                <Button variant="outline" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <CartButton onOpen={() => setIsCartOpen(true)} />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div 
          className="py-12"
          style={{ 
            backgroundColor: storeSettings?.primary_color || '#FEF7CD',
            color: storeSettings?.hero_text_color || '#000000'
          }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4">{storeSettings?.hero_title || 'Delicious food,\ndelivered to you'}</h2>
            <p className="mb-6">{storeSettings?.hero_subtitle || 'Order your favorite meals from the best restaurants'}</p>
            <Button 
              className="text-white hover:opacity-90"
              style={{ backgroundColor: storeSettings?.hero_text_color || '#000000' }}
            >
              Order Now
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 py-8">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <Button
              key="all"
              variant={selectedCategory === null ? "default" : "outline"}
              className="whitespace-nowrap rounded-full"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                className="whitespace-nowrap rounded-full"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="container mx-auto px-4 pb-24">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-6">Featured Items</h3>
              <MenuSection 
                onAddToCart={(item) => {
                  setSelectedProduct(item);
                  setIsDialogOpen(true);
                }}
                featured={true}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">
                {selectedCategory || "All Items"}
              </h3>
              <MenuSection 
                onAddToCart={(item) => {
                  setSelectedProduct(item);
                  setIsDialogOpen(true);
                }}
                category={selectedCategory}
              />
            </div>
          </div>
        </div>

        <FloatingCartBar onCartClick={() => setIsCartOpen(true)} />

        <Cart 
          open={isCartOpen} 
          onClose={() => setIsCartOpen(false)}
        />

        {selectedProduct && (
          <ProductDialog
            product={selectedProduct}
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setSelectedProduct(null);
            }}
          />
        )}

        <Footer />
      </div>
    </CartProvider>
  );
};

const CartButton = ({ onOpen }: { onOpen: () => void }) => {
  const { items } = useContext(CartContext);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button 
      variant="outline"
      className="relative"
      onClick={onOpen}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  );
};

export default Index;