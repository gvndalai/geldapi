const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const refreshToken =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(refreshToken, secretKey);

    req.user = decoded;
    console.log("req.user", req.user);

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
module.exports = { verifyToken };
