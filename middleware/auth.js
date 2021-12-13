const session = require("express-session");

function auth(req, res, next) {
  if (!req.session.email || !req.session.password) {
    return res.status(404).send("error");
  }

  next();
}

module.exports = { auth };
