import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface AddonFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddonForm = ({ onClose, onSuccess }: AddonFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const { data: addons, isLoading } = useQuery({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("menu_items")
        .insert([{ 
          name, 
          price: Number(price),
          category: 'addon',
          is_available: true
        }]);

      if (error) throw error;

      toast({ title: "Addon created successfully" });
      setName("");
      setPrice("");
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      onSuccess();
    } catch (error: any) {
      console.error("Error saving addon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save addon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Addon deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['addons'] });
    } catch (error: any) {
      console.error("Error deleting addon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete addon",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString('en-NG')}`;
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

        <h2 className="text-lg font-semibold mb-4">Manage Addons</h2>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="name">Addon Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Addon"}
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500 mb-2">Existing Addons</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : addons?.length === 0 ? (
            <p className="text-sm text-gray-500">No addons found</p>
          ) : (
            <div className="space-y-2">
              {addons?.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="text-sm font-medium">{addon.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {formatPrice(addon.price)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addon.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddonForm;