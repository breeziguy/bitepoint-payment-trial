import { Image, Upload } from "lucide-react";

interface MenuItemImageUploadProps {
  imageUrl: string;
  imageFile: File | null;
  onImageChange: (file: File) => void;
}

const MenuItemImageUpload = ({ imageUrl, imageFile, onImageChange }: MenuItemImageUploadProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="image">Image</label>
      <div className="flex items-center gap-4">
        {(imageUrl || imageFile) && (
          <div className="relative w-20 h-20">
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
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
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onImageChange(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default MenuItemImageUpload;