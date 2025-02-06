
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { formatPrice } from "@/utils/formatPrice";

export const RevenueTrendsChart = () => {
  const { data: orderTrends } = useQuery({
    queryKey: ['order-trends'],
    queryFn: async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: orders } = await supabase
          .from('orders')
          .select('created_at, total_amount')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (!orders) return [];

        return orders.reduce((acc: any[], order) => {
          const date = format(new Date(order.created_at), 'MMM dd');
          const existingDate = acc.find(item => item.date === date);
          
          if (existingDate) {
            existingDate.amount += Number(order.total_amount);
            existingDate.orders += 1;
          } else {
            acc.push({
              date,
              amount: Number(order.total_amount),
              orders: 1
            });
          }
          
          return acc;
        }, []);
      } catch (error: any) {
        console.error('Error fetching trends:', error.message);
        return [];
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {orderTrends && orderTrends.length > 0 ? (
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatPrice(value)}
                />
                <Tooltip 
                  formatter={(value: any) => formatPrice(value)}
                  labelStyle={{ color: 'black' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};
