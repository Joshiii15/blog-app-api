//Dependencies and Modules
const jwt = require("jsonwebtoken");
const { model } = require("mongoose");
const secret = "BlogApp";

//JSON Web Tokens

const ERROR_MESSAGES = {
  noToken: "Failed. No token provided.",
  authFailed: "Failed. Authentication error.",
};

//Create access token
module.exports.createAccessToken = (user) => {
  const { _id, email, isAdmin } = user;
  const payload = { id: _id, email, isAdmin };

  //Sign the JWT with a payload, secret, and optional configs
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

//Middleware to verify the token
module.exports.verify = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; //Extract token after "Bearer"

  if (!token) {
    return res
      .status(401)
      .send({ auth: "Failed", message: ERROR_MESSAGES.noToken });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).send({
        auth: "Failed",
        message: err.message || ERROR_MESSAGES.authFailed,
      });
    }
    req.user = decoded;
    next();
  });
};

//Middleware to check if the use is authenticated/logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

//Middleware to verify the user is Admin
module.exports.verifyAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).send({
      auth: "Failed",
      message: "Action Forbidden",
    });
  }
};

//Error Handler Middleware
module.exports.errorHandler = (err, req, res, next) => {
  //Log the error ( only in the development mode)
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  //Extract details from the error object, with defaults
  const {
    status = 500,
    message = "Internal Server Error",
    code = "SERVER ERROR",
    details = null,
  } = err;

  //Send a standardized JSON response
  res.status(status).json({
    error: {
      message,
      errorCode: code,
      details,
    },
  });
};
