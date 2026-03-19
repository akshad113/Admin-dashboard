// Format a number as rupees for the customer UI.
export const formatRupees = (value: number | string | null | undefined) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return "NA";
  }

  return `Rs ${Math.round(parsedValue)}`;
};

// Format a date/time string for order history.
export const formatDateTime = (value?: string) => {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

// Read a product feature payload and return a clean string list.
export const parseFeatures = (features: unknown) => {
  if (Array.isArray(features)) {
    return features.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof features === "string") {
    const trimmed = features.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};
