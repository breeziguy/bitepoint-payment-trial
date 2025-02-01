import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface MenuItemBasicInfoProps {
  formData: {
    name: string;
    price: number;
    description: string;
    category: string;
    is_featured: boolean;
  };
  categories: any[];
  onChange: (field: string, value: any) => void;
}

const MenuItemBasicInfo = ({ formData, categories, onChange }: MenuItemBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
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
          onChange={(e) => onChange("price", parseFloat(e.target.value) || 0)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => onChange("category", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.name}>
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
          onChange={(e) => onChange("description", e.target.value)}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) => onChange("is_featured", checked as boolean)}
        />
        <Label htmlFor="is_featured">Featured Item</Label>
      </div>
    </>
  );
};

export default MenuItemBasicInfo;