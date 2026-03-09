import { create } from "zustand";
import axios from "axios";

const parseCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const useShopStore = create((set) => ({
  categories: [],
  products: [],
  searchTerm: "",
  selectedCategory: "All",
  isLoadingCategories: true,
  isLoadingProducts: true,
  categoriesError: "",
  productsError: "",
  cartItems: [],

  setSearchTerm: (value) => set({ searchTerm: value }),
  setSelectedCategory: (value) => set({ selectedCategory: value }),

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

  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cartItems.find(
        (item) => item.product.product_id === product.product_id
      );

      if (existingItem) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.product.product_id === product.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      return {
        cartItems: [...state.cartItems, { product, quantity: 1 }]
      };
    })
}));
