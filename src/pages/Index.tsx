import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MenuSection from "@/components/MenuSection";
import { useCart } from "@/components/CartContext";
import Cart from "@/components/Cart";
import FloatingCartBar from "@/components/FloatingCartBar";
import { useState } from "react";
import ProductDialog from "@/components/ProductDialog";

export default function Index() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setShowProductDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/7f61132e-33b5-4372-98bf-302459f06a0b.png" 
              alt="Store Logo" 
              className="h-12 w-auto"
            />
          </div>
          <Link to="/admin">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Featured Items</h2>
              <MenuSection onAddToCart={handleAddToCart} featured={true} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Menu</h2>
              <MenuSection onAddToCart={handleAddToCart} category={selectedCategory} />
            </div>
          </div>

          <div className="md:col-span-1">
            <Cart />
          </div>
        </div>
      </div>

      <FloatingCartBar />

      {showProductDialog && selectedItem && (
        <ProductDialog
          item={selectedItem}
          onClose={() => {
            setShowProductDialog(false);
            setSelectedItem(null);
          }}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}