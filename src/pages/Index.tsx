import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import { CartProvider, CartContext } from "@/components/CartContext";
import ProductDialog from "@/components/ProductDialog";
import FloatingCartBar from "@/components/FloatingCartBar";
import { Link } from "react-router-dom";

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold">Food Frenzy</h1>
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
        <div className="bg-[#FEF7CD] py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4">Delicious food,<br />delivered to you</h2>
            <p className="text-gray-700 mb-6">Order your favorite meals from the best restaurants</p>
            <Button className="bg-black text-white hover:bg-black/90">Order Now</Button>
          </div>
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 py-8">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {["All", "Main Dishes", "Beverages", "Desserts", "Snacks"].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="whitespace-nowrap rounded-full"
              >
                {category}
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
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Popular Right Now</h3>
              <MenuSection 
                onAddToCart={(item) => {
                  setSelectedProduct(item);
                  setIsDialogOpen(true);
                }} 
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