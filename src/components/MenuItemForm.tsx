import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MenuItemBasicInfo from "./menu/MenuItemBasicInfo";
import MenuItemAddonSelect from "./menu/MenuItemAddonSelect";
import MenuItemImageUpload from "./menu/MenuItemImageUpload";

interface MenuItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: MenuItem;
}

const MenuItemForm = ({ onClose, onSuccess, initialData }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    description: initialData?.description || "",
    category: initialData?.category || "",
    image_url: initialData?.image_url || "",
    is_featured: initialData?.is_featured || false,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', 'addon')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (initialData?.id) {
      const fetchExistingAddons = async () => {
        const { data, error } = await supabase
          .from('menu_addons')
          .select('addon_item_id')
          .eq('menu_item_id', initialData.id);
        
        if (!error && data) {
          setSelectedAddons(data.map(item => item.addon_item_id));
        }
      };
      fetchExistingAddons();
    }
  }, [initialData?.id]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddonChange = (addonId: string, checked: boolean) => {
    if (checked) {
      setSelectedAddons([...selectedAddons, addonId]);
    } else {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          throw new Error('Authentication required for image upload');
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(filePath, imageFile, {
            upsert: false,
            contentType: imageFile.type
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const data = {
        ...formData,
        price: Number(formData.price) || 0,
        image_url: imageUrl,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from("menu_items")
          .update(data)
          .eq("id", initialData.id);

        if (error) throw error;

        await supabase
          .from("menu_addons")
          .delete()
          .eq("menu_item_id", initialData.id);

        if (selectedAddons.length > 0) {
          const addonRecords = selectedAddons.map(addonId => ({
            menu_item_id: initialData.id,
            addon_item_id: addonId
          }));

          const { error: addonError } = await supabase
            .from("menu_addons")
            .insert(addonRecords);

          if (addonError) throw addonError;
        }

        toast({ title: "Menu item updated successfully" });
      } else {
        const { data: newItem, error } = await supabase
          .from("menu_items")
          .insert([data])
          .select()
          .single();
        
        if (error) throw error;

        if (selectedAddons.length > 0 && newItem) {
          const addonRecords = selectedAddons.map(addonId => ({
            menu_item_id: newItem.id,
            addon_item_id: addonId
          }));

          const { error: addonError } = await supabase
            .from("menu_addons")
            .insert(addonRecords);

          if (addonError) throw addonError;
        }
        
        toast({ title: "Menu item created successfully" });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving menu item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Menu Item" : "Add New Menu Item"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <MenuItemBasicInfo
            formData={formData}
            categories={categories || []}
            onChange={handleFormChange}
          />

          {formData.category !== 'addon' && (
            <MenuItemAddonSelect
              addons={addons || []}
              selectedAddons={selectedAddons}
              onAddonChange={handleAddonChange}
            />
          )}

          <MenuItemImageUpload
            imageUrl={formData.image_url}
            imageFile={imageFile}
            onImageChange={setImageFile}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;