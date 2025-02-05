export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
  category_id: string | null;
}