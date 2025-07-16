const jwt = require("jsonwebtoken");

module.exports = (rolesAllowed = []) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token" });

      req.user = user; // user contains id, username, role

      if (rolesAllowed.length > 0 && !rolesAllowed.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    });
  };
};
