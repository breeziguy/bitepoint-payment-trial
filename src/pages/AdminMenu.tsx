import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Image, Plus, FolderPlus } from "lucide-react";
import MenuItemForm from "@/components/MenuItemForm";
import CategoryForm from "@/components/CategoryForm";
import { useToast } from "@/components/ui/use-toast";
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
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, categories(name)');
      
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', deleteItem.id);

      if (error) throw error;

      toast({ title: "Menu item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    } catch (error) {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                      <Image className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{formatPrice(item.price)}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showForm && (
        <MenuItemForm
          initialData={editingItem}
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
