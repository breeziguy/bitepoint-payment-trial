import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MenuItemAddonSelectProps {
  addons: any[];
  selectedAddons: string[];
  onAddonChange: (addonId: string, checked: boolean) => void;
}

const MenuItemAddonSelect = ({ addons, selectedAddons, onAddonChange }: MenuItemAddonSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Available Addons</Label>
      <div className="space-y-2 border rounded-md p-3">
        {addons?.map((addon) => (
          <div key={addon.id} className="flex items-center space-x-2">
            <Checkbox
              id={`addon-${addon.id}`}
              checked={selectedAddons.includes(addon.id)}
              onCheckedChange={(checked) => {
                onAddonChange(addon.id, checked as boolean);
              }}
            />
            <Label htmlFor={`addon-${addon.id}`}>
              {addon.name} - ₦{addon.price}
            </Label>
          </div>
        ))}
        {(!addons || addons.length === 0) && (
          <p className="text-sm text-gray-500">No addons available</p>
        )}
      </div>
    </div>
  );
};

export default MenuItemAddonSelect;