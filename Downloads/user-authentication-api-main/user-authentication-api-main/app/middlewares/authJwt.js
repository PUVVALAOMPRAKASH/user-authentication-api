const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(403).send({ message: "No token provided!" });

    const decoded = jwt.verify(token, config.secret);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).send({ message: "Unauthorized!" });
  }
};

const checkRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).populate("roles");
      if (!user) return res.status(404).send({ message: "User not found." });

      const hasRole = user.roles.some((r) => r.name === roleName);
      if (!hasRole)
        return res.status(403).send({ message: `Require ${roleName} Role!` });

      next();
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
};

const authJwt = {
  verifyToken,
  isAdmin: checkRole("admin"),
  isModerator: checkRole("moderator"),
};

module.exports = authJwt;
