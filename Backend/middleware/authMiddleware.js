const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user information 
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  const normalizedUserRoles = userRoles.map((role) => String(role).toLowerCase());
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase());

  const hasPermission = normalizedAllowedRoles.some((role) =>
    normalizedUserRoles.includes(role)
  );

  if (!hasPermission) {
    return res.status(403).json({
      message: "Forbidden"
    });
  }

  return next();
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.authorizeRoles = authorizeRoles;
