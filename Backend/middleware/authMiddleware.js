const jwt = require("jsonwebtoken");

// Extract the bearer token from the Authorization header.
const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1] || null;
};

// Convert any role values into a lowercase string array.
const normalizeRoles = (roles) => roles.map((role) => String(role).toLowerCase());

// Check whether the user has at least one role from the allowed list.
const hasAllowedRole = (userRoles, allowedRoles) => {
  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);

  return normalizedAllowedRoles.some((role) => normalizedUserRoles.includes(role));
};

// Verify the JWT and attach the decoded user payload to req.user.
const verifyToken = (req, res, next) => {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Allow the request only when the user has one of the listed roles.
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];

  if (!hasAllowedRole(userRoles, allowedRoles)) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  return next();
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.authorizeRoles = authorizeRoles;
