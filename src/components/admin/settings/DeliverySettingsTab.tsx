import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryZone {
  id: string;
  name: string;
  price: number;
}

export default function DeliverySettingsTab() {
  const [newZone, setNewZone] = useState({ name: "", price: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ["delivery-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as DeliveryZone[];
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

  return (
    <div className="space-y-6">
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

      {zonesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}