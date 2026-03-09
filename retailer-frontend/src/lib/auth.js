const RETAILER_TOKEN_KEY = "retailer_token";
const RETAILER_USER_KEY = "retailer_user";

export const getRetailerToken = () => localStorage.getItem(RETAILER_TOKEN_KEY);

export const getRetailerUser = () => {
  const raw = localStorage.getItem(RETAILER_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

export const setRetailerSession = ({ token, user }) => {
  localStorage.setItem(RETAILER_TOKEN_KEY, token);
  localStorage.setItem(RETAILER_USER_KEY, JSON.stringify(user || {}));
};

export const clearRetailerSession = () => {
  localStorage.removeItem(RETAILER_TOKEN_KEY);
  localStorage.removeItem(RETAILER_USER_KEY);
};

export const hasRetailerAccess = () => {
  const token = getRetailerToken();
  const user = getRetailerUser();

  if (!token || !user) {
    return false;
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role) => {
    const normalized = String(role).toLowerCase();
    return normalized === "manager" || normalized === "admin";
  });
};
