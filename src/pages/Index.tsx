import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Plus, Minus, ChevronLeft } from "lucide-react";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import { CartProvider, CartContext } from "@/components/CartContext";
import ProductDialog from "@/components/ProductDialog";

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <header className="bg-[#075E54] text-white p-4 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Restaurant Name</h1>
            <CartButton onOpen={() => setIsCartOpen(true)} />
          </div>
        </header>

        <main className="container mx-auto p-4 max-w-4xl">
          {/* Navigation Tabs */}
          <div className="w-full mb-6">
            <div className="grid w-full grid-cols-2 max-w-[200px] mx-auto">
              <button
                className={`py-2 ${activeTab === "home" ? "border-b-2 border-[#075E54]" : ""}`}
                onClick={() => setActiveTab("home")}
              >
                Home
              </button>
              <button
                className={`py-2 ${activeTab === "search" ? "border-b-2 border-[#075E54]" : ""}`}
                onClick={() => setActiveTab("search")}
              >
                Search
              </button>
            </div>
          </div>

          {activeTab === "home" && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Featured Items</h2>
                <MenuSection 
                  onAddToCart={(item) => {
                    setSelectedProduct(item);
                    setIsDialogOpen(true);
                  }} 
                />
              </div>
            </>
          )}

          {activeTab === "search" && (
            <div className="p-4">
              <SearchBar />
            </div>
          )}
        </main>

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

const CartButton = ({ onOpen }) => {
  const { items } = useContext(CartContext);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button 
      variant="ghost" 
      className="text-white hover:text-white/80"
      onClick={onOpen}
    >
      <ShoppingCart className="mr-2" />
      {totalItems > 0 && (
        <span className="bg-[#FF9F1C] rounded-full px-2 py-1 text-xs">
          {totalItems}
        </span>
      )}
    </Button>
  );
};

const SearchBar = () => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search for dishes..."
        className="w-full p-3 border rounded-lg pl-10"
      />
      <X className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
    </div>
  );
};

export default Index;