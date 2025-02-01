import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SubscriptionBanner } from "@/components/admin/SubscriptionBanner";
import { StoreAccessGuard } from "@/components/admin/StoreAccessGuard";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout() {
  return (
    <StoreAccessGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <div className="flex-1">
            <SubscriptionBanner />
            <main className="p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </StoreAccessGuard>
  );
}