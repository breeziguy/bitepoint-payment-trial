import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SubscriptionBanner } from "@/components/admin/SubscriptionBanner";
import { StoreAccessGuard } from "@/components/admin/StoreAccessGuard";

export default function AdminLayout() {
  return (
    <StoreAccessGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1">
          <SubscriptionBanner />
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </StoreAccessGuard>
  );
}