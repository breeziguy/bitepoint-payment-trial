import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCartItems([...cartItems, item]);
  };

  return (
    <div className="min-h-screen bg-[#FFF1E6]">
      <header className="bg-[#075E54] text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Restaurant Name</h1>
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="mr-2" />
            <span className="bg-[#FF9F1C] rounded-full px-2 py-1 text-xs">
              {cartItems.length}
            </span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <MenuSection onAddToCart={addToCart} />
      </main>

      <Cart 
        open={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  );
};

export default Index;