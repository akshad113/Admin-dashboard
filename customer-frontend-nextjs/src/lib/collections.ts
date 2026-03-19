import type { ApiListResponse, Category, Product } from "./types";

// Flatten API responses that may wrap arrays inside different data keys.
export const unwrapList = <T,>(payload: ApiListResponse<T> | undefined): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  return [];
};

// Extract the home page category and product arrays from the backend payload.
export const unwrapHomeCollections = (payload: {
  data?: { categories?: ApiListResponse<Category>; products?: ApiListResponse<Product> };
  categories?: ApiListResponse<Category>;
  products?: ApiListResponse<Product>;
}) => {
  const homeData = payload?.data ?? {};

  return {
    categories: unwrapList(homeData.categories ?? payload.categories),
    products: unwrapList(homeData.products ?? payload.products),
  };
};
