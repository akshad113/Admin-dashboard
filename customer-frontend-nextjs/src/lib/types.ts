export type AuthUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

export type ApiError = {
  message?: string;
  error?: string;
};

export type ApiListResponse<T> = T[] | { data?: T[] } | { data?: { data?: T[] } };

export type Category = {
  category_id: number;
  name: string;
};

export type Product = {
  product_id: number;
  name: string;
  description?: string | null;
  brand?: string | null;
  price: number;
  mrp?: number | null;
  rating?: number | null;
  review_count?: number | null;
  features?: string[] | string | null;
  stock_quantity?: number | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  user_id?: number | null;
  created_at?: string;
  updated_at?: string;
  image_url?: string | null;
  status?: string;
  category_name?: string | null;
  subcategory_name?: string | null;
  user_name?: string | null;
  user_email?: string | null;
};

export type CartItem = {
  cart_item_id?: number;
  product_id: number;
  product_name: string;
  category_name?: string | null;
  quantity: number;
  unit_price: number;
  line_total?: number;
  image_url?: string | null;
};

export type CartSummary = {
  itemCount: number;
  totalAmount: number;
};

export type OrderItem = {
  order_item_id: number;
  product_id?: number;
  quantity: number;
  unit_price: number;
  product_name: string;
};

export type Order = {
  order_id: number;
  created_at?: string;
  status?: string;
  total_amount: number;
  items?: OrderItem[];
};

export type AuthResponse = {
  message?: string;
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};

export type HomeResponse = {
  data?: {
    categories?: ApiListResponse<Category>;
    products?: ApiListResponse<Product>;
  };
  categories?: ApiListResponse<Category>;
  products?: ApiListResponse<Product>;
};

export type CartResponse = {
  data?: CartItem[];
  summary?: CartSummary;
  message?: string;
};

export type OrdersResponse = {
  data?: Order[];
  message?: string;
};
