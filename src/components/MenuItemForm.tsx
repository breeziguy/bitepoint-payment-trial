import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, Image } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    price: number;
    description: string;
    category_id?: string;
    image_url?: string;
  };
}

const MenuItemForm = ({ onClose, onSuccess, initialData }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    description: initialData?.description || "",
    category_id: initialData?.category_id || "",
    image_url: initialData?.image_url || "",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('Authentication required for image upload');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError, data } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
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
        toast({ title: "Menu item updated successfully" });
      } else {
        const { error } = await supabase
          .from("menu_items")
          .insert([data]);
        
        if (error) throw error;
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
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
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
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₦)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category_id: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <div className="flex items-center gap-4">
              {(formData.image_url || imageFile) && (
                <div className="relative w-20 h-20">
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 p-2 border border-dashed rounded hover:bg-gray-50">
                    {imageFile ? (
                      <Upload className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Image className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {imageFile ? "Change image" : "Upload image"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>

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