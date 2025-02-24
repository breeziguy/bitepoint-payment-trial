
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ItemAddonDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, notes: string, addons: MenuItem[]) => void;
}

export default function ItemAddonDialog({ item, isOpen, onClose, onAdd }: ItemAddonDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const { data: addons } = useQuery({
    queryKey: ['menu-addons', item.id],
    queryFn: async () => {
      const { data: menuAddons, error: menuAddonsError } = await supabase
        .from('menu_addons')
        .select('addon_item_id')
        .eq('menu_item_id', item.id);

      if (menuAddonsError) throw menuAddonsError;

      if (!menuAddons?.length) return [];

      const { data: addonItems, error: addonItemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', menuAddons.map(a => a.addon_item_id));

      if (addonItemsError) throw addonItemsError;
      return addonItems || [];
    },
  });

  const handleAdd = () => {
    const selectedAddonItems = addons?.filter(addon => 
      selectedAddons.includes(addon.id)
    ) || [];
    onAdd(item, quantity, notes, selectedAddonItems);
    setQuantity(1);
    setNotes("");
    setSelectedAddons([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-500">₦{item.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {addons && addons.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Add-ons</h4>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddons(prev => [...prev, addon.id]);
                          } else {
                            setSelectedAddons(prev => prev.filter(id => id !== addon.id));
                          }
                        }}
                      />
                      <Label htmlFor={addon.id}>{addon.name}</Label>
                    </div>
                    <span className="text-sm">₦{addon.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="Add notes to your order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleAdd}>
            Add to Order - ₦{(item.price * quantity).toLocaleString()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
