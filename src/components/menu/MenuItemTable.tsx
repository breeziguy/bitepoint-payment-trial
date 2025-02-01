import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Image } from "lucide-react";

interface MenuItemTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

const formatPrice = (price: number) => {
  return `₦${price.toLocaleString('en-NG')}`;
};

const MenuItemTable = ({ items, onEdit, onDelete }: MenuItemTableProps) => {
  return (
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
        {items?.map((item) => (
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
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MenuItemTable;