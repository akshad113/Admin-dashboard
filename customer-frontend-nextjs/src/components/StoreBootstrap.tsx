"use client";

import { useEffect } from "react";

import { useAuthStore } from "../store/useAuthStore";

// Hydrate the customer session once when the app starts.
export default function StoreBootstrap() {
  const hydrateCustomer = useAuthStore((state) => state.hydrateCustomer);

  useEffect(() => {
    hydrateCustomer();
  }, [hydrateCustomer]);

  return null;
}
