
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Calendar, Clock, PowerCircle, Pencil, Plus, Minus, X } from "lucide-react";
import { format } from "date-fns";
import ItemAddonDialog from "@/components/pos/ItemAddonDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface POSItem extends MenuItem {
  quantity: number;
  notes?: string;
  addons?: MenuItem[];
}

type PaymentMethod = 'cash' | 'transfer' | 'card';

export default function AdminPOS() {
  const [cart, setCart] = useState<POSItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>();
  const [deliveryAddress, setDeliveryAddress] = useState("");

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

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .neq('category', 'addon');
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    notes: string,
    addons: MenuItem[] = []
  ) => {
    setCart(prev => [...prev, { ...item, quantity, notes, addons }]);
  };

  const calculateItemTotal = (item: POSItem) => {
    const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
    return (item.price + addonsTotal) * item.quantity;
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.10; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="text-gray-500" />
            <span>{format(new Date(), "EEE, dd MMM yyyy")}</span>
            <Clock className="text-gray-500 ml-4" />
            <span>{format(new Date(), "HH:mm a")}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="destructive" size="sm">
              Close Order
            </Button>
            <PowerCircle className="text-gray-500 cursor-pointer" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-64px)]">
        {/* Left side - Menu */}
        <div className="col-span-8 space-y-4">
          {/* Categories */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            <Card 
              className={`p-4 cursor-pointer flex flex-col items-center min-w-[100px] ${!selectedCategory ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <div className="text-2xl mb-1">🍽️</div>
              <div className="text-sm">All Menu</div>
              <div className="text-xs text-gray-500">{menuItems?.length || 0} Items</div>
            </Card>
            {categories?.map((category) => (
              <Card 
                key={category.id}
                className={`p-4 cursor-pointer flex flex-col items-center min-w-[100px] ${selectedCategory === category.name ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="text-2xl mb-1">🥖</div>
                <div className="text-sm">{category.name}</div>
                <div className="text-xs text-gray-500">
                  {menuItems?.filter(item => item.category === category.name).length || 0} Items
                </div>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search something sweet on your mind..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-4 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {menuItems?.map((item) => (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-square mb-2">
                  <img
                    src={item.image_url || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-sm">{item.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{item.category}</span>
                  <span className="font-semibold">₦{item.price.toLocaleString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right side - Order details */}
        <div className="col-span-4 bg-white rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              {isEditingName ? (
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  placeholder="Enter customer name"
                />
              ) : (
                <>
                  <h2 className="text-xl font-semibold">
                    {customerName || "Customer's Name"}
                  </h2>
                  <p className="text-sm text-gray-500">Order Number: #001</p>
                </>
              )}
            </div>
            <Pencil 
              className="text-gray-500 cursor-pointer" 
              onClick={() => setIsEditingName(true)}
            />
          </div>

          <div className="mb-4">
            <Select value={orderType} onValueChange={(value) => {
              setOrderType(value);
              setDeliveryAddress("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">Dine In</SelectItem>
                <SelectItem value="takeaway">Takeaway</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>

            {orderType === 'delivery' && (
              <Input
                className="mt-2"
                placeholder="Delivery Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No Item Selected
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start py-2 border-b">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setCart(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">₦{item.price.toLocaleString()}</p>
                    {item.addons && item.addons.length > 0 && (
                      <div className="ml-4 text-sm text-gray-500">
                        {item.addons.map((addon, i) => (
                          <div key={i}>+ {addon.name} (₦{addon.price.toLocaleString()})</div>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-medium">₦{calculateItemTotal(item).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">x{item.quantity}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>₦{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax 10%</span>
              <span>₦{calculateTax().toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>TOTAL</span>
              <span>₦{calculateTotal().toLocaleString()}</span>
            </div>

            <div className="grid gap-2 mt-4">
              <Button variant="outline" className="w-full" onClick={() => setShowPaymentMethods(true)}>
                {selectedPaymentMethod ? `Pay with ${selectedPaymentMethod}` : 'Select Payment Method'}
              </Button>
              <Button variant="outline" className="w-full">
                Save Order
              </Button>
              <Button variant="outline" className="w-full">
                Close Order
              </Button>
              <Button className="w-full" size="lg">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemAddonDialog
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAddToCart}
        />
      )}

      <Dialog open={showPaymentMethods} onOpenChange={setShowPaymentMethods}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
              className="h-24"
              onClick={() => {
                setSelectedPaymentMethod('cash');
                setShowPaymentMethods(false);
              }}
            >
              Cash
            </Button>
            <Button
              variant={selectedPaymentMethod === 'transfer' ? 'default' : 'outline'}
              className="h-24"
              onClick={() => {
                setSelectedPaymentMethod('transfer');
                setShowPaymentMethods(false);
              }}
            >
              Bank Transfer
            </Button>
            <Button
              variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
              className="h-24"
              onClick={() => {
                setSelectedPaymentMethod('card');
                setShowPaymentMethods(false);
              }}
            >
              Card Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
