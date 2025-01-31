import { Plus } from "lucide-react";

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
}

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Mile High Turkey",
    description: "Turkey and Provolone Cheese on a White Roll Each hand-crafted deli sub is piled high with freshly sliced meats",
    price: 6.50,
    category: "Sandwiches",
    image: "/lovable-uploads/d0949cf0-7c05-4a55-b4a5-58a02a0c7a6d.png"
  },
  {
    id: "2",
    name: "Italian Sub",
    description: "Ham, prosciutto, capicola, Genoa salami, and provolone cheese on a white roll. Each hand-crafted deli sub is piled high with freshly sliced meats",
    price: 6.50,
    category: "Sandwiches",
    image: "/lovable-uploads/d0949cf0-7c05-4a55-b4a5-58a02a0c7a6d.png"
  },
  {
    id: "3",
    name: "American Club",
    description: "Ham, turkey, bacon, and provolone cheese on a white roll. Each hand-crafted deli sub is piled high with freshly sliced meats",
    price: 6.50,
    category: "Popular",
    image: "/lovable-uploads/d0949cf0-7c05-4a55-b4a5-58a02a0c7a6d.png"
  },
  {
    id: "4",
    name: "Deluxe Club",
    description: "Turkey, roast beef, bacon, and provolone cheese on a white roll. Each hand-crafted deli sub is piled high with freshly sliced meats",
    price: 6.50,
    category: "Sandwiches",
    image: "/lovable-uploads/d0949cf0-7c05-4a55-b4a5-58a02a0c7a6d.png"
  }
];

const MenuSection = ({ onAddToCart }: MenuSectionProps) => {
  const formatPrice = (price: number) => {
    return `₦${(price * 1000).toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      {menuItems.map((item) => (
        <div key={item.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg">
          <div className="w-24 h-24 relative flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{formatPrice(item.price)}</p>
                {item.category === "Popular" && (
                  <span className="text-green-600 text-sm">Popular</span>
                )}
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