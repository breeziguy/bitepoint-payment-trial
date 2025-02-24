
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FolderPlus, Plus } from "lucide-react";
import MenuItemForm from "@/components/MenuItemForm";
import CategoryForm from "@/components/CategoryForm";
import AddonForm from "@/components/AddonForm";
import { useToast } from "@/components/ui/use-toast";
import MenuItemTable from "@/components/menu/MenuItemTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminMenu() {
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .neq('category', 'addon');
      
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', deleteItem.id);

      if (error) throw error;

      toast({ 
        title: "Success",
        description: "Menu item deleted successfully" 
      });
      
      // Refresh the menu items list
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    } catch (error: any) {
      console.error("Error deleting menu item:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    } finally {
      setDeleteItem(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <div className="flex gap-2">
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowCategoryForm(true)}
          >
            <FolderPlus className="h-4 w-4" /> Manage Categories
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddonForm(true)}
          >
            <FolderPlus className="h-4 w-4" /> Manage Addons
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Menu Item
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <MenuItemTable
          items={menuItems || []}
          onEdit={(item) => {
            setEditingItem(item);
            setShowForm(true);
          }}
          onDelete={setDeleteItem}
        />
      </div>

      {showForm && (
        <MenuItemForm
          initialData={editingItem || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
          }}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          onClose={() => setShowCategoryForm(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          }}
        />
      )}

      {showAddonForm && (
        <AddonForm
          onClose={() => setShowAddonForm(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['addons'] });
          }}
        />
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item
              "{deleteItem?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
