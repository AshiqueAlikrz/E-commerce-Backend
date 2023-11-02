const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const token = req.headers["authorization"].split(" ")[1];
  console.log("token", token);

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }
  jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.username = decoded.username;
    next();
  });
};
