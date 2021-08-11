const jwt = require("jsonwebtoken");
const Therapist = require("../models/TherapistModel");

module.exports.therapistAuth = (req, res, next) => {
  const token = req.header("Authorization");

  console.log("therapist auth midddlware");

  //check web token exist and valid
  if (token) {
    jwt.verify(token, "mySecretJWT", (err, decoded) => {
      if (err) {
        console.log(err.message);
      } else {
        req.therapistId = decoded.therapistId;
        console.log("therapist auth decoded", req.therapistId);
        next();
      }
    });
  } else {
    console.log("no jwt");
  }
};

//check user
module.exports.checkUser = (req, res, next) => {
  const token = req.header("Authorization");

  if (token) {
    jwt.verify(token, "mySecretJWT", async (err, decoded) => {
      if (err) {
        console.log(err.message);
      } else {
        req.therapistId = decoded.therapistId;
        next();
      }
    });
  } else {
    // res.locals.therapist = null;
  }
};
