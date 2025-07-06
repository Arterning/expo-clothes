export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  image_url: string;
  masked_image_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  season?: string;
  storage_location?: string;
  brand?: string;
  price?: number;
  size?: string;
  link?: string;
  purchase_date?: string;
  washing_method?: string;
}
