import axios from "axios";
import { create } from "zustand";

const parseCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const withAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const useShopStore = create((set, get) => ({
  categories: [],
  products: [],
  searchTerm: "",
  selectedCategory: "All",
  isLoadingCategories: true,
  isLoadingProducts: true,
  categoriesError: "",
  productsError: "",

  cartItems: [],
  cartSummary: {
    itemCount: 0,
    totalAmount: 0
  },
  cartLoading: false,
  cartError: "",

  orders: [],
  ordersLoading: false,
  orderError: "",
  orderSuccess: "",

  setSearchTerm: (value) => set({ searchTerm: value }),
  setSelectedCategory: (value) => set({ selectedCategory: value }),

  resetShopSession: () =>
    set({
      cartItems: [],
      cartSummary: { itemCount: 0, totalAmount: 0 },
      cartLoading: false,
      cartError: "",
      orders: [],
      ordersLoading: false,
      orderError: "",
      orderSuccess: ""
    }),

  loadHomeData: async () => {
    set({
      isLoadingCategories: true,
      isLoadingProducts: true,
      categoriesError: "",
      productsError: ""
    });

    try {
      const response = await axios.get("/api/customer/home", {
        params: { limit: 24 }
      });

      const homeData = response?.data?.data || {};
      const categoryPayload = homeData.categories ?? response?.data?.categories;
      const productPayload = homeData.products ?? response?.data?.products;

      const hasCategoryArray =
        Array.isArray(categoryPayload) || Array.isArray(categoryPayload?.data);
      const hasProductArray =
        Array.isArray(productPayload) || Array.isArray(productPayload?.data);

      if (!hasCategoryArray || !hasProductArray) {
        throw new Error("Unexpected response shape from /api/customer/home");
      }

      set({
        categories: parseCollection(categoryPayload),
        products: parseCollection(productPayload)
      });
    } catch (error) {
      console.error("Error fetching homepage data:", error);
      set({
        categories: [],
        products: [],
        categoriesError: "Unable to load categories right now.",
        productsError: "Unable to load featured products right now."
      });
    } finally {
      set({
        isLoadingCategories: false,
        isLoadingProducts: false
      });
    }
  },

  loadCart: async (token) => {
    if (!token) {
      set({
        cartItems: [],
        cartSummary: { itemCount: 0, totalAmount: 0 },
        cartLoading: false,
        cartError: ""
      });
      return;
    }

    set({ cartLoading: true, cartError: "" });

    try {
      const response = await axios.get("/api/customer/cart", withAuthHeaders(token));
      set({
        cartItems: Array.isArray(response.data?.data) ? response.data.data : [],
        cartSummary: response.data?.summary || { itemCount: 0, totalAmount: 0 }
      });
    } catch (error) {
      console.error("Error loading cart:", error);
      set({
        cartItems: [],
        cartSummary: { itemCount: 0, totalAmount: 0 },
        cartError: error?.response?.data?.message || "Unable to load cart"
      });
    } finally {
      set({ cartLoading: false });
    }
  },

  addToCart: async (product, token) => {
    if (!token) {
      set({ cartError: "Please login to add items to cart." });
      return;
    }

    try {
      await axios.post(
        "/api/customer/cart/items",
        {
          product_id: product.product_id,
          quantity: 1
        },
        withAuthHeaders(token)
      );

      set({ cartError: "", orderSuccess: "" });
      await get().loadCart(token);
    } catch (error) {
      set({ cartError: error?.response?.data?.message || "Unable to add item to cart" });
    }
  },

  incrementCartItem: async (productId, token) => {
    if (!token) {
      return;
    }

    const item = get().cartItems.find((entry) => Number(entry.product_id) === Number(productId));
    if (!item) {
      return;
    }

    try {
      await axios.put(
        `/api/customer/cart/items/${productId}`,
        { quantity: Number(item.quantity) + 1 },
        withAuthHeaders(token)
      );
      await get().loadCart(token);
    } catch (error) {
      set({ cartError: error?.response?.data?.message || "Unable to update cart item" });
    }
  },

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
        await axios.delete(`/api/customer/cart/items/${productId}`, withAuthHeaders(token));
      } else {
        await axios.put(
          `/api/customer/cart/items/${productId}`,
          { quantity: Number(item.quantity) - 1 },
          withAuthHeaders(token)
        );
      }

      await get().loadCart(token);
    } catch (error) {
      set({ cartError: error?.response?.data?.message || "Unable to update cart item" });
    }
  },

  removeCartItem: async (productId, token) => {
    if (!token) {
      return;
    }

    try {
      await axios.delete(`/api/customer/cart/items/${productId}`, withAuthHeaders(token));
      await get().loadCart(token);
    } catch (error) {
      set({ cartError: error?.response?.data?.message || "Unable to remove cart item" });
    }
  },

  loadOrders: async (token) => {
    if (!token) {
      set({ orders: [], ordersLoading: false, orderError: "", orderSuccess: "" });
      return;
    }

    set({ ordersLoading: true, orderError: "" });

    try {
      const response = await axios.get("/api/customer/orders/mine", withAuthHeaders(token));
      set({ orders: Array.isArray(response.data?.data) ? response.data.data : [] });
    } catch (error) {
      console.error("Error loading orders:", error);
      set({
        orders: [],
        orderError: error?.response?.data?.message || "Unable to load orders"
      });
    } finally {
      set({ ordersLoading: false });
    }
  },

  placeOrder: async (token) => {
    if (!token) {
      set({ orderError: "Please login to place an order." });
      return;
    }

    set({ orderError: "", orderSuccess: "" });

    try {
      const response = await axios.post(
        "/api/customer/orders/checkout",
        {},
        withAuthHeaders(token)
      );

      set({ orderSuccess: response.data?.message || "Order placed successfully" });
      await Promise.all([get().loadCart(token), get().loadOrders(token)]);
    } catch (error) {
      set({ orderError: error?.response?.data?.message || "Unable to place order" });
    }
  }
}));
