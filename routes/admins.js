const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {check, validationResult} = require('express-validator');

const User = require('../models/User');
const {userAuth, adminAuth} = require('../middlewares/auth');

//@ route          POST   api/admins
//@descrption      Register admin
//@access          Public
router.post(
  '/',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password should be 6 characters or more').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password, ...rest} = req.body;
    try {
      //see if admin exist
      let user = await User.findOne({email});
      if (user) {
        return res.status(400).json({errors: [{msg: 'Admin  already exists'}]});
      }

      user = new User({
        name,
        email,
        password,
        isAdmin: true,
        ...rest,
      });

      //encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //return JWT
      const payload = {
        user: {
          id: user.id,
          isAdmin: user.isAdmin,
        },
      };

      jwt.sign(
        payload,
        process.env.jwtSecret,
        {expiresIn: 36000},
        (err, token) => {
          if (err) throw err;
          res.status(200).json({token});
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

//@ route         GET api/admins
//@descrption      get all users
//@access          private
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({isAdmin: false});
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@ route         GET api/admins/user/:user_id
//@descrption      get user by user_id
//@access          private
router.get('/user/:user_id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);

    if (!user) return res.status(400).json({msg: 'User not found'});
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({msg: 'User not found'});
    }
    res.status(500).send('Server error');
  }
});

//@ route         DELETE api/admins/user/:user_id
//@descrption      delete user profile , user & posts
//@access          private
router.delete('/user/:user_id', adminAuth, async (req, res) => {
  try {
    //remove user posts @todo
    // await Post.deleteMany({user: req.params.user_id});
    //remove user
    await User.findOneAndDelete({_id: req.params.user_id});

    res.json({msg: 'User deleted'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@admin dashboard @TO DO

module.exports = router;
