
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MenuItemAddonSelectProps {
  addons: MenuItem[];
  selectedAddons: string[];
  onAddonChange: (addonId: string, checked: boolean) => void;
}

const ADDON_CATEGORIES = [
  { value: 'protein', label: 'Protein Options' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'extras', label: 'Extra Toppings' },
  { value: 'packs', label: 'Food Packs' },
];

const MenuItemAddonSelect = ({ addons, selectedAddons, onAddonChange }: MenuItemAddonSelectProps) => {
  // Group addons by category
  const groupedAddons = addons.reduce((acc, addon) => {
    const category = addon.addon_category || 'others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(addon);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleSelectAllInCategory = (category: string, selected: boolean) => {
    const categoryAddons = groupedAddons[category] || [];
    categoryAddons.forEach((addon) => {
      if (selected !== selectedAddons.includes(addon.id)) {
        onAddonChange(addon.id, selected);
      }
    });
  };

  const getCategoryLabel = (category: string) => {
    return ADDON_CATEGORIES.find(cat => cat.value === category)?.label || 'Other Options';
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryAddons = groupedAddons[category] || [];
    return categoryAddons.every(addon => selectedAddons.includes(addon.id));
  };

  return (
    <div className="space-y-2">
      <Label>Available Addons</Label>
      <div className="space-y-4 border rounded-md p-4">
        {Object.entries(groupedAddons).map(([category, categoryAddons]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{getCategoryLabel(category)}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAllInCategory(category, !isCategoryFullySelected(category))}
              >
                {isCategoryFullySelected(category) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-4">
              {categoryAddons.map((addon) => (
                <div key={addon.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`addon-${addon.id}`}
                    checked={selectedAddons.includes(addon.id)}
                    onCheckedChange={(checked) => {
                      onAddonChange(addon.id, checked as boolean);
                    }}
                  />
                  <Label htmlFor={`addon-${addon.id}`} className="text-sm">
                    {addon.name} - ₦{addon.price}
                  </Label>
                </div>
              ))}
            </div>
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
