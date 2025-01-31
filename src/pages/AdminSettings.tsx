import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import StoreContactSettings from "@/components/admin/StoreContactSettings";
import BillingSettings from "@/components/admin/BillingSettings";

export default function AdminSettings() {
  const [newZone, setNewZone] = useState({ name: "", price: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storeSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching store settings:", error);
        throw error;
      }
      
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("store_settings")
          .insert([{
            store_name: "Food Frenzy",
            store_address: "123 Main Street",
            store_city: "City",
            store_state: "State",
            primary_color: "#9b87f5",
            hero_title: "Delicious food, delivered to you",
            hero_subtitle: "Order your favorite meals from the best restaurants",
            hero_text_color: "#000000",
            whatsapp_number: "+2348000000000"
          }])
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating store settings:", insertError);
          throw insertError;
        }
        return newSettings;
      }
      
      return data;
    },
  });

  const { data: zones, isLoading: zonesLoading } = useQuery({
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

  const updateStoreMutation = useMutation({
    mutationFn: async (settings: {
      store_name: string;
      store_address: string;
      store_city: string;
      store_state: string;
      primary_color: string;
      hero_title: string;
      hero_subtitle: string;
      hero_text_color: string;
    }) => {
      if (!storeSettings?.id) {
        throw new Error("No store settings found");
      }

      const { error } = await supabase
        .from("store_settings")
        .update({
          ...settings,
          whatsapp_number: storeSettings.whatsapp_number || "+2348000000000"
        })
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

  const handleUpdateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateStoreMutation.mutateAsync({
        store_name: formData.get("store_name") as string || "Food Frenzy",
        store_address: formData.get("address") as string || "123 Main Street",
        store_city: formData.get("city") as string || "City",
        store_state: formData.get("state") as string || "State",
        primary_color: formData.get("primary_color") as string || "#9b87f5",
        hero_title: formData.get("hero_title") as string || "Delicious food, delivered to you",
        hero_subtitle: formData.get("hero_subtitle") as string || "Order your favorite meals from the best restaurants",
        hero_text_color: formData.get("hero_text_color") as string || "#000000",
      });
    } catch (error) {
      console.error("Error in handleUpdateStore:", error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="store" className="w-full">
        <TabsList>
          <TabsTrigger value="store">Store Settings</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <form onSubmit={handleUpdateStore} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    name="primary_color"
                    type="color"
                    defaultValue={storeSettings?.primary_color}
                    className="w-24"
                  />
                  <Input
                    type="text"
                    value={storeSettings?.primary_color}
                    readOnly
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_text_color">Hero Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="hero_text_color"
                    name="hero_text_color"
                    type="color"
                    defaultValue={storeSettings?.hero_text_color}
                    className="w-24"
                  />
                  <Input
                    type="text"
                    value={storeSettings?.hero_text_color}
                    readOnly
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_title">Hero Title</Label>
                <Input
                  id="hero_title"
                  name="hero_title"
                  defaultValue={storeSettings?.hero_title}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                <Input
                  id="hero_subtitle"
                  name="hero_subtitle"
                  defaultValue={storeSettings?.hero_subtitle}
                />
              </div>
            </div>
            <Button type="submit" disabled={updateStoreMutation.isPending}>
              {updateStoreMutation.isPending ? "Updating..." : "Update Branding"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          {settingsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <StoreContactSettings storeSettings={storeSettings} />
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
