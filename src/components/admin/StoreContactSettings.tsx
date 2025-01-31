import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoreContactSettingsProps {
  storeSettings: {
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

      const { error } = await supabase
        .from("store_settings")
        .update({ whatsapp_number: whatsappNumber })
        .eq("id", storeSettings.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      
      toast({
        title: "Success",
        description: "WhatsApp number updated successfully",
      });
    } catch (error) {
      console.error("Error updating WhatsApp number:", error);
      toast({
        title: "Error",
        description: "Failed to update WhatsApp number",
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
        {isUpdating ? "Updating..." : "Update WhatsApp Number"}
      </Button>
    </form>
  );
};

export default StoreContactSettings;