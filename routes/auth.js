const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {check, validationResult} = require('express-validator');
const {sendConfirmationEmail} = require('../utils/emails/nodemailer.config');

const User = require('../models/User');
const {userAuth, adminAuth} = require('../middlewares/auth');

//@ route          api/auth/loadUser
//@descrption      user
//@access          private
//get authenticated user  data upon login
router.get('/loadUser', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('appointments')
      .populate({
        path: 'appointments',
        populate: {
          path: 'therapist',
          model: 'Therapist',
        },
      })
      .populate({
        path: 'appointments',
        populate: {
          path: 'booking',
          populate: {
            path: 'user',
            model: 'user',
          },
        },
      });

    //sort appointments by date
    if (user.appointments.length > 0) {
      user.appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

//@ route          api/auth/loadAdmin
//@descrption      admin
//@access          private
//get authenticated  admin data upon login
router.get('/loadAdmin', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

//@ route          POST   api/auth
//@descrption      authenticate and login user or admin & get his\her token
//@access          Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    // console.log('login');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;
    try {
      //see if user exist
      let user = await User.findOne({email});
      if (!user) {
        return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
      }

      //check if email is verified or not :)
      if (user.status !== 'Active') {
        // console.log('login failed');
        return res.status(401).json({
          errors: [{msg: 'Pending Account. Please Verify Your Email!'}],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
      }

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
          if (user.isAdmin) {
            res.status(200).json({
              msg: 'Admin logged in successfully',
              token,
              isAdmin: user.isAdmin,
            });
          }
          res.status(200).json({
            msg: 'User logged in successfully',
            token,
            isAdmin: user.isAdmin,
          });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

//get user by id -- authenication needed here ###
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({message: 'User Not found.'});
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
