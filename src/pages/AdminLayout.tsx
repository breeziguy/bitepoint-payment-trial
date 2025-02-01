import { Outlet, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionBanner } from "@/components/admin/SubscriptionBanner";
import { StoreAccessGuard } from "@/components/admin/StoreAccessGuard";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SidebarProvider>
      <StoreAccessGuard>
        <div className="min-h-screen flex flex-col w-full">
          <div className="flex flex-1">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
              <SubscriptionBanner />
              <main className="flex-1 p-8 bg-gray-50">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </StoreAccessGuard>
    </SidebarProvider>
  );
}