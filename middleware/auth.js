const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const accessToken =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  console.log("accessToken", accessToken);

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(accessToken, secretKey);

    req.user = decoded;
    console.log("req.user", req.user);

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
module.exports = { verifyToken };
