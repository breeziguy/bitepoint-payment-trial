
import { createBrowserRouter, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMenu from "./pages/AdminMenu";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";
import AdminPOS from "./pages/AdminPOS";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import TrackOrder from "./pages/TrackOrder";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionError from "./pages/SubscriptionError";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/track/:token",
    element: <TrackOrder />,
  },
  {
    path: "/subscription/success",
    element: (
      <ProtectedRoute>
        <SubscriptionSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subscription/error",
    element: (
      <ProtectedRoute>
        <SubscriptionError />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
      {
        path: "menu",
        element: <AdminMenu />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
      {
        path: "pos",
        element: <AdminPOS />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
