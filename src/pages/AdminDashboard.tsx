
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { RevenueTrendsChart } from "@/components/admin/dashboard/RevenueTrendsChart";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardStats />
      <RevenueTrendsChart />
      <RecentOrders />
    </div>
  );
}
