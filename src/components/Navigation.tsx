import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Navigation() {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  return (
    <nav className="flex items-center justify-between p-4">
      <Link to="/" className="text-xl font-bold">
        Bitepoint
      </Link>
      <div className="flex items-center gap-4">
        {session && (
          <Button asChild variant="outline">
            <Link to="/admin">Admin</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}