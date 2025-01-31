import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

export default function AdminDelivery() {
  const [newZone, setNewZone] = useState({ name: "", price: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: zones, isLoading } = useQuery({
    queryKey: ["delivery-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: storeSettings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const addZoneMutation = useMutation({
    mutationFn: async (zone: typeof newZone) => {
      const { error } = await supabase.from("delivery_zones").insert([
        {
          name: zone.name,
          price: parseFloat(zone.price),
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
      setNewZone({ name: "", price: "" });
      toast({
        title: "Success",
        description: "Delivery zone added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add delivery zone",
        variant: "destructive",
      });
      console.error("Error adding delivery zone:", error);
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (settings: {
      store_address: string;
      store_city: string;
      store_state: string;
    }) => {
      if (storeSettings?.id) {
        const { error } = await supabase
          .from("store_settings")
          .update(settings)
          .eq("id", storeSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("store_settings")
          .insert([settings]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast({
        title: "Success",
        description: "Store settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update store settings",
        variant: "destructive",
      });
      console.error("Error updating store settings:", error);
    },
  });

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name || !newZone.price) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    addZoneMutation.mutate(newZone);
  };

  const handleUpdateStore = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateStoreMutation.mutate({
      store_address: formData.get("address") as string,
      store_city: formData.get("city") as string,
      store_state: formData.get("state") as string,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Store Settings</h2>
        <form onSubmit={handleUpdateStore} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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
          <Button type="submit">Update Store Settings</Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Delivery Zones</h2>
        <form onSubmit={handleAddZone} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="name">Zone Name</Label>
              <Input
                id="name"
                value={newZone.name}
                onChange={(e) =>
                  setNewZone((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter zone name"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="price">Delivery Price (₦)</Label>
              <Input
                id="price"
                type="number"
                value={newZone.price}
                onChange={(e) =>
                  setNewZone((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="Enter delivery price"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Add Zone</Button>
            </div>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone Name</TableHead>
              <TableHead>Delivery Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones?.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell>{zone.name}</TableCell>
                <TableCell>₦{zone.price.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}