const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.userAuth = async (req, res, next) => {
  //get token from header
  const token = req.header('Authorization');

  //check if there is no token
  if (!token) {
    return res.status(401).send({msg: 'No token, authorization denied'});
  }

  //verify token and unlock the payload(decoded)
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);

    //assign the payload(decoded)=> to req.user
    req.user = decoded.user;
    if (req.user.isAdmin) return res.status(400).json({msg: 'UnAuthorized'});

    next();
  } catch (error) {
    res.status(401).json({msg: 'Token is not valid'});
  }
};

module.exports.adminAuth = async (req, res, next) => {
  //get token from header
  const token = req.header('Authorization');

  //check if there is no token
  if (!token) {
    return res.status(401).send({msg: 'No token, authorization denied'});
  }

  //verify token and unlock the payload(decoded)
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);

    //assign the payload(decoded)=> to req.user
    req.user = decoded.user;

    if (!req.user.isAdmin) return res.status(400).json({msg: 'UnAuthorized'});

    next();
  } catch (error) {
    res.status(401).json({msg: 'Token is not valid'});
  }
};
