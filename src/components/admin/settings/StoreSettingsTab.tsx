import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StoreSettings {
  id: string;
  store_name: string;
  store_address: string;
  store_city: string;
  store_state: string;
}

export default function StoreSettingsTab({ storeSettings }: { storeSettings: StoreSettings | null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStoreMutation = useMutation({
    mutationFn: async (settings: Partial<StoreSettings>) => {
      if (!storeSettings?.id) {
        throw new Error("No store settings found");
      }

      const { error } = await supabase
        .from("store_settings")
        .update(settings)
        .eq("id", storeSettings.id);

      if (error) {
        console.error("Error updating store settings:", error);
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Store settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update store settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating store settings:", error);
    },
  });

  const handleUpdateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateStoreMutation.mutateAsync({
        store_name: formData.get("store_name") as string || "Food Frenzy",
        store_address: formData.get("address") as string || "123 Main Street",
        store_city: formData.get("city") as string || "City",
        store_state: formData.get("state") as string || "State",
      });
    } catch (error) {
      console.error("Error in handleUpdateStore:", error);
    }
  };

  return (
    <form onSubmit={handleUpdateStore} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="store_name">Store Name</Label>
          <Input
            id="store_name"
            name="store_name"
            defaultValue={storeSettings?.store_name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Store Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={storeSettings?.store_address}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={storeSettings?.store_city}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            defaultValue={storeSettings?.store_state}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={updateStoreMutation.isPending}>
        {updateStoreMutation.isPending ? "Updating..." : "Update Store Settings"}
      </Button>
    </form>
  );
}