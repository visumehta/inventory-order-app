export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  master_sku: string;
  quantity: number;
 is_banned?: boolean;
 image_url?: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
