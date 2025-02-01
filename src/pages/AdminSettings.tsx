import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import StoreContactSettings from "@/components/admin/StoreContactSettings";
import BillingSettings from "@/components/admin/BillingSettings";
import StoreSettingsTab from "@/components/admin/settings/StoreSettingsTab";
import DeliverySettingsTab from "@/components/admin/settings/DeliverySettingsTab";
import BrandingSettingsTab from "@/components/admin/settings/BrandingSettingsTab";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export default function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "store";

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

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setSearchParams({ tab });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs value={currentTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
        <TabsList>
          <TabsTrigger value="store">Store Settings</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          {settingsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <StoreSettingsTab storeSettings={storeSettings} />
          )}
        </TabsContent>

        <TabsContent value="delivery">
          <DeliverySettingsTab />
        </TabsContent>

        <TabsContent value="branding">
          {settingsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <BrandingSettingsTab storeSettings={storeSettings} />
          )}
        </TabsContent>

        <TabsContent value="contact">
          {settingsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <StoreContactSettings storeSettings={storeSettings} />
          )}
        </TabsContent>

        <TabsContent value="billing">
          <BillingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}