import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MenuSection from "@/components/MenuSection";
import { useCart } from "@/components/CartContext";
import Cart from "@/components/Cart";
import FloatingCartBar from "@/components/FloatingCartBar";
import { useState } from "react";
import ProductDialog from "@/components/ProductDialog";
import type { MenuItem } from "@/types/menu";

export default function Index() {
  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const handleAddToCart = (item: MenuItem) => {
    setSelectedProduct(item);
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
              className="h-8 w-auto" // Reduced size from h-12 to h-8
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
              <MenuSection onAddToCart={handleAddToCart} />
            </div>
          </div>
        </div>
      </div>

      <Cart open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <FloatingCartBar onCartClick={() => setIsCartOpen(true)} />

      {showProductDialog && selectedProduct && (
        <ProductDialog
          product={selectedProduct}
          isOpen={showProductDialog}
          onClose={() => {
            setShowProductDialog(false);
            setSelectedProduct(null);
          }}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}