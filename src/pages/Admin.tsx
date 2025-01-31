import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const { toast } = useToast();

  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');
      
      if (error) {
        toast({
          title: "Error fetching menu items",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))');
      
      if (error) {
        toast({
          title: "Error fetching orders",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
  });

  if (menuLoading || ordersLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Available</th>
                </tr>
              </thead>
              <tbody>
                {menuItems?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">${item.price}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">{item.is_available ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="p-2">{order.customer_name}</td>
                    <td className="p-2">{order.customer_phone}</td>
                    <td className="p-2">${order.total_amount}</td>
                    <td className="p-2">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;