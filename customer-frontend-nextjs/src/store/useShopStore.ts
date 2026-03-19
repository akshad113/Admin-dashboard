import { create } from "zustand";

import { requestApi, withAuthHeaders } from "../lib/api";
import { unwrapHomeCollections } from "../lib/collections";
import type { CartItem, CartResponse, CartSummary, HomeResponse, Order, OrdersResponse, Product } from "../lib/types";

type ShopStore = {
  categories: { category_id: number; name: string }[];
  products: Product[];
  searchTerm: string;
  selectedCategory: string;
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  categoriesError: string;
  productsError: string;
  cartItems: CartItem[];
  cartSummary: CartSummary;
  cartLoading: boolean;
  cartError: string;
  orders: Order[];
  ordersLoading: boolean;
  orderError: string;
  orderSuccess: string;
  setSearchTerm: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  resetShopSession: () => void;
  loadHomeData: () => Promise<void>;
  loadCart: (token: string | null) => Promise<void>;
  addToCart: (product: Product, token: string | null) => Promise<void>;
  incrementCartItem: (productId: number, token: string | null) => Promise<void>;
  decrementCartItem: (productId: number, token: string | null) => Promise<void>;
  removeCartItem: (productId: number, token: string | null) => Promise<void>;
  loadOrders: (token: string | null) => Promise<void>;
  placeOrder: (token: string | null) => Promise<void>;
};

const emptyCartSummary = {
  itemCount: 0,
  totalAmount: 0,
};

// Create the customer shopping store for products, cart, and order state.
export const useShopStore = create<ShopStore>((set, get) => ({
  categories: [],
  products: [],
  searchTerm: "",
  selectedCategory: "All",
  isLoadingCategories: true,
  isLoadingProducts: true,
  categoriesError: "",
  productsError: "",
  cartItems: [],
  cartSummary: emptyCartSummary,
  cartLoading: false,
  cartError: "",
  orders: [],
  ordersLoading: false,
  orderError: "",
  orderSuccess: "",

  // Update the search term used by the home page filters.
  setSearchTerm: (value) => set({ searchTerm: value }),

  // Update the selected category used by the home page filters.
  setSelectedCategory: (value) => set({ selectedCategory: value }),

  // Clear the cart and order session state when the user logs out.
  resetShopSession: () =>
    set({
      cartItems: [],
      cartSummary: emptyCartSummary,
      cartLoading: false,
      cartError: "",
      orders: [],
      ordersLoading: false,
      orderError: "",
      orderSuccess: "",
    }),

  // Load the categories and products shown on the home page.
  loadHomeData: async () => {
    set({
      isLoadingCategories: true,
      isLoadingProducts: true,
      categoriesError: "",
      productsError: "",
    });

    try {
      const response = await requestApi<HomeResponse>("/api/customer/home?limit=24");
      const homeCollections = unwrapHomeCollections(response);

      set({
        categories: homeCollections.categories,
        products: homeCollections.products,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load home data";
      set({
        categories: [],
        products: [],
        categoriesError: message,
        productsError: message,
      });
    } finally {
      set({
        isLoadingCategories: false,
        isLoadingProducts: false,
      });
    }
  },

  // Load the authenticated user's cart.
  loadCart: async (token) => {
    if (!token) {
      set({
        cartItems: [],
        cartSummary: emptyCartSummary,
        cartLoading: false,
        cartError: "",
      });
      return;
    }

    set({ cartLoading: true, cartError: "" });

    try {
      const response = await requestApi<CartResponse>("/api/customer/cart", {
        headers: withAuthHeaders(token),
      });

      set({
        cartItems: Array.isArray(response.data) ? response.data : [],
        cartSummary: response.summary ?? emptyCartSummary,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load cart";
      set({
        cartItems: [],
        cartSummary: emptyCartSummary,
        cartError: message,
      });
    } finally {
      set({ cartLoading: false });
    }
  },

  // Add one product to the cart and refresh the cart state.
  addToCart: async (product, token) => {
    if (!token) {
      set({ cartError: "Please login to add items to your cart." });
      return;
    }

    try {
      await requestApi("/api/customer/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(token),
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: 1,
        }),
      });

      set({ cartError: "", orderSuccess: "" });
      await get().loadCart(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add item";
      set({ cartError: message });
    }
  },

  // Increase the quantity of a single cart item.
  incrementCartItem: async (productId, token) => {
    if (!token) {
      return;
    }

    const item = get().cartItems.find((entry) => Number(entry.product_id) === Number(productId));

    if (!item) {
      return;
    }

    try {
      await requestApi(`/api/customer/cart/items/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(token),
        },
        body: JSON.stringify({ quantity: Number(item.quantity) + 1 }),
      });

      await get().loadCart(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update cart item";
      set({ cartError: message });
    }
  },

  // Decrease the quantity of a cart item or remove it when quantity reaches one.
  decrementCartItem: async (productId, token) => {
    if (!token) {
      return;
    }

    const item = get().cartItems.find((entry) => Number(entry.product_id) === Number(productId));

    if (!item) {
      return;
    }

    try {
      if (Number(item.quantity) <= 1) {
        await requestApi(`/api/customer/cart/items/${productId}`, {
          method: "DELETE",
          headers: withAuthHeaders(token),
        });
      } else {
        await requestApi(`/api/customer/cart/items/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...withAuthHeaders(token),
          },
          body: JSON.stringify({ quantity: Number(item.quantity) - 1 }),
        });
      }

      await get().loadCart(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update cart item";
      set({ cartError: message });
    }
  },

  // Remove an item from the cart.
  removeCartItem: async (productId, token) => {
    if (!token) {
      return;
    }

    try {
      await requestApi(`/api/customer/cart/items/${productId}`, {
        method: "DELETE",
        headers: withAuthHeaders(token),
      });

      await get().loadCart(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove cart item";
      set({ cartError: message });
    }
  },

  // Load the order history for the authenticated customer.
  loadOrders: async (token) => {
    if (!token) {
      set({ orders: [], ordersLoading: false, orderError: "", orderSuccess: "" });
      return;
    }

    set({ ordersLoading: true, orderError: "" });

    try {
      const response = await requestApi<OrdersResponse>("/api/customer/orders/mine", {
        headers: withAuthHeaders(token),
      });

      set({ orders: Array.isArray(response.data) ? response.data : [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load orders";
      set({ orders: [], orderError: message });
    } finally {
      set({ ordersLoading: false });
    }
  },

  // Turn the current cart into a paid order and refresh both cart and order data.
  placeOrder: async (token) => {
    if (!token) {
      set({ orderError: "Please login to place an order." });
      return;
    }

    set({ orderError: "", orderSuccess: "" });

    try {
      const response = await requestApi<{ message?: string }>("/api/customer/orders/checkout", {
        method: "POST",
        headers: withAuthHeaders(token),
      });

      set({ orderSuccess: response.message ?? "Order placed successfully" });
      await Promise.all([get().loadCart(token), get().loadOrders(token)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to place order";
      set({ orderError: message });
    }
  },
}));
