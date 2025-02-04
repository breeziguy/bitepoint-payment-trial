import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SubscriptionBanner } from "@/components/admin/SubscriptionBanner";
import { StoreAccessGuard } from "@/components/admin/StoreAccessGuard";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout() {
  return (
    <StoreAccessGuard>
      <SidebarProvider>
        <div className="flex flex-col md:flex-row min-h-screen w-full">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            <SubscriptionBanner />
            <main className="p-4 md:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </StoreAccessGuard>
  );
}