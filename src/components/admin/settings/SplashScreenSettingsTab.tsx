
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export default function SplashScreenSettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('store_settings')
        .update(values)
        .eq('id', settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast({
        title: "Success",
        description: "Splash screen settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update splash screen settings",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('splash-screens')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('splash-screens')
        .getPublicUrl(fileName);

      await updateSettings.mutateAsync({ splash_logo_url: publicUrl });
    } catch (error) {
      console.error('Error uploading splash screen:', error);
      toast({
        title: "Error",
        description: "Failed to upload splash screen image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Splash Screen Settings</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="splash-logo">Splash Screen Logo</Label>
            <Input
              id="splash-logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
            {settings?.splash_logo_url && (
              <img
                src={settings.splash_logo_url}
                alt="Splash Screen Logo"
                className="mt-4 max-w-[200px]"
              />
            )}
          </div>

          <div>
            <Label htmlFor="splash-background">Background Color</Label>
            <Input
              id="splash-background"
              type="color"
              value={settings?.splash_background_color || '#ffffff'}
              onChange={(e) => {
                updateSettings.mutate({ splash_background_color: e.target.value });
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
