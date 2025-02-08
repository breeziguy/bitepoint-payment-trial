
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
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Available Addons</Label>
      <div className="space-y-6 bg-gray-50 rounded-lg p-6">
        {Object.entries(groupedAddons).map(([category, categoryAddons]) => (
          <div key={category} className="bg-white rounded-md shadow-sm p-4">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <Label className="text-base font-medium text-gray-800">
                {getCategoryLabel(category)}
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-gray-100"
                onClick={() => handleSelectAllInCategory(category, !isCategoryFullySelected(category))}
              >
                {isCategoryFullySelected(category) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categoryAddons.map((addon) => (
                <div 
                  key={addon.id} 
                  className="flex items-center space-x-3 bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={`addon-${addon.id}`}
                    checked={selectedAddons.includes(addon.id)}
                    onCheckedChange={(checked) => {
                      onAddonChange(addon.id, checked as boolean);
                    }}
                    className="h-5 w-5"
                  />
                  <Label 
                    htmlFor={`addon-${addon.id}`} 
                    className="text-sm text-gray-700 cursor-pointer"
                  >
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

