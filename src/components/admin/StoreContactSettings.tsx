import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoreContactSettingsProps {
  storeSettings?: {
    id: string;
    whatsapp_number: string;
  };
}

const StoreContactSettings = ({ storeSettings }: StoreContactSettingsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const whatsappNumber = formData.get("whatsapp_number") as string;

      console.log("Current store settings:", storeSettings);
      console.log("Attempting to save WhatsApp number:", whatsappNumber);

      if (!storeSettings?.id) {
        // If no settings exist, create new ones
        const { data: newSettings, error: insertError } = await supabase
          .from("store_settings")
          .insert([{
            store_name: "Food Frenzy",
            store_address: "123 Main Street",
            store_city: "City",
            store_state: "State",
            whatsapp_number: whatsappNumber
          }])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating store settings:", insertError);
          throw insertError;
        }

        console.log("Created new store settings:", newSettings);
      } else {
        // Update existing settings
        const { error: updateError } = await supabase
          .from("store_settings")
          .update({ whatsapp_number: whatsappNumber })
          .eq("id", storeSettings.id);

        if (updateError) {
          console.error("Error updating WhatsApp number:", updateError);
          throw updateError;
        }

        console.log("Updated WhatsApp number for settings ID:", storeSettings.id);
      }

      await queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      
      toast({
        title: "Success",
        description: "WhatsApp number saved successfully",
      });
    } catch (error) {
      console.error("Error saving WhatsApp number:", error);
      toast({
        title: "Error",
        description: "Failed to save WhatsApp number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="whatsapp_number">WhatsApp Business Number</Label>
        <Input
          id="whatsapp_number"
          name="whatsapp_number"
          defaultValue={storeSettings?.whatsapp_number}
          placeholder="+234XXXXXXXXXX"
          required
        />
        <p className="text-sm text-gray-500">
          Enter the full number with country code (e.g., +234XXXXXXXXXX)
        </p>
      </div>
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Saving..." : "Save WhatsApp Number"}
      </Button>
    </form>
  );
};

export default StoreContactSettings;