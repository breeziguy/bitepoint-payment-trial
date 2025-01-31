import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
}

// Sample menu data (we'll move this to Supabase later)
const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, and basil",
    price: 12.99,
    category: "Pizza",
    image: "placeholder.svg"
  },
  {
    id: "2",
    name: "Chicken Burger",
    description: "Grilled chicken with lettuce and special sauce",
    price: 9.99,
    category: "Burgers",
    image: "placeholder.svg"
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce, croutons, and caesar dressing",
    price: 8.99,
    category: "Salads",
    image: "placeholder.svg"
  }
];

const MenuSection = ({ onAddToCart }: MenuSectionProps) => {
  const formatPrice = (price: number) => {
    return `₦${(price * 1000).toLocaleString()}`; // Converting to Naira and formatting
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-48 object-cover"
          />
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{item.name}</span>
              <span className="text-[#FF9F1C]">{formatPrice(item.price)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <Button 
              className="w-full bg-[#075E54] hover:bg-[#075E54]/90"
              onClick={() => onAddToCart(item)}
            >
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MenuSection;