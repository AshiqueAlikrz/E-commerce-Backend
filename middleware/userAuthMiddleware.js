const jwt = require("jsonwebtoken");

module.exports = function verify(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    console.log(token);

    if (!token) {
      return res.status(403).json({ error: "no token found" });
    }

    jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "unauthorized" });
      }
      req.username = decoded.username;
      next();
    });
  } catch (err) {
    res.status(403).json({ error: "no token found" });
  }
};
