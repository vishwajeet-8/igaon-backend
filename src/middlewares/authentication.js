const jwt = require("jsonwebtoken");

async function isAuthenticate(req, res, next) {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        message: "Token Missing",
      });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
}

module.exports = isAuthenticate;
