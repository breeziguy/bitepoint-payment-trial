import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StoreSettings {
  id: string;
  primary_color: string;
  hero_text_color: string;
  hero_title: string;
  hero_subtitle: string;
}

export default function BrandingSettingsTab({ storeSettings }: { storeSettings: StoreSettings | null }) {
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
        description: "Branding settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update branding settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating branding settings:", error);
    },
  });

  const handleUpdateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateStoreMutation.mutateAsync({
        primary_color: formData.get("primary_color") as string || "#9b87f5",
        hero_text_color: formData.get("hero_text_color") as string || "#000000",
        hero_title: formData.get("hero_title") as string || "Delicious food, delivered to you",
        hero_subtitle: formData.get("hero_subtitle") as string || "Order your favorite meals from the best restaurants",
      });
    } catch (error) {
      console.error("Error in handleUpdateStore:", error);
    }
  };

  return (
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
  );
}