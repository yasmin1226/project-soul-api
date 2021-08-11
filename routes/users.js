const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {check, validationResult} = require('express-validator');
const {transport} = require('../utils/emails/nodemailer.config');
const {confirmEmail} = require('../utils/emails/confirm');
const {resetPassword} = require('../utils/emails/reset-password');
const {contactUs} = require('../utils/emails/contact-us');

const User = require('../models/User');
const {userAuth} = require('../middlewares/auth');

//@ route          POST   api/users
//@descrption      Register user
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

    let {name, email, password, ...rest} = req.body;
    try {
      //see if user exist
      let user = await User.findOne({email});
      if (user) {
        return res.status(400).json({errors: [{msg: 'User  already exists'}]});
      }

      //encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      //create new user
      //save the user data to database
      user = await User.create({
        name: name,
        email: email,
        password: password,
        ...rest,
      });

      //return JWT
      const payload = {
        user: {
          id: user.id,
          isAdmin: user.isAdmin,
        },
      };

      //create token
      const token = jwt.sign(payload, process.env.jwtSecret);
      const confirmLink = `${process.env.API_URI}/api/users/confirm-user-email/${token}`;
      //send email to complete regiseration
      await transport.sendMail({
        from: `Soul-Team 👻 <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Please confirm your account',
        html: confirmEmail(name, email, confirmLink),
      });

      res.status(200).json({status: user.status});
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

//confimation user's email route
//@ route          POST   api/users/confirm-user-email/:token
//@descrption      confirm user email
//@access         private through email.
router.get('/confirm-user-email/:token', async (req, res) => {
  try {
    const {token} = req.params;
    //token ==> user:{id,isAdmin}
    const {
      user: {id},
    } = await jwt.verify(token, process.env.jwtSecret);
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).send({msg: 'User Not found.'});
    }

    //update user email status to active
    user.status = 'Active';
    await user.save();
    //redirect to a verified email page after email verified to login into the website as verified account
    res
      .status(200)
      .redirect(`${process.env.FRONTEND_URI}/user-email-confirmed`);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

//change password
//@ route          PUT   api/users/change-password
//@descrption      change user password
//@access         private through email
router.put('/change-password', userAuth, async (req, res) => {
  try {
    let {password, newPassword} = req.body;
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send({message: 'User Not found.'});
    }

    let isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(401).json({errors: [{msg: 'Wrong password'}]});
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(newPassword, salt);
    user.password = password;

    await User.findOneAndUpdate({_id: user.id}, {$set: user}, {new: true});

    res.status(200).send({
      msg: 'Password has been changed successfully',
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({errors: [{msg: 'Changing password failed'}]});
  }
});

//reset password if user forgot it
//@ route          PUT   api/users/reset-password
//@descrption      change user password
//@access         private through email
router.put('/reset-password', userAuth, async (req, res) => {
  try {
    let {newPassword} = req.body;
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send({message: 'User Not found.'});
    }

    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(newPassword, salt);
    user.password = newPassword;

    await User.findOneAndUpdate({_id: user.id}, {$set: user}, {new: true});

    res.status(200).send({
      msg: 'Password has been reset successfully',
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({errors: [{msg: 'Reseting password failed'}]});
  }
});

//forgot password
//@ route          PUT   api/users/forgot-password
//@descrption      reset user password
//@access         Public through email
router.post('/forgot-password', async (req, res) => {
  try {
    let {email} = req.body;
    email = email.trim();
    let user = await User.findOne({email});
    if (!user) {
      return res.status(404).send({message: 'User is not register'});
    }

    //return JWT
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    //create token that expires after 60 mins
    const token = jwt.sign(payload, process.env.jwtSecret, {
      expiresIn: 60 * 60,
    });

    const resetPasswordLink = `${process.env.FRONTEND_URI}/reset-password/${token}`;

    // send mail with the reset password link
    await transport.sendMail({
      from: `Soul-Team  <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset',
      html: resetPassword(user.name, resetPasswordLink),
    });
    res
      .status(200)
      .json({msg: 'Reset password resquest has been sent successfully'});
  } catch (err) {
    console.log(err.message);
    res.status(400).json({errors: [{msg: 'Reset password resquest failed'}]});
  }
});

//contact us
//@ route          POST   api/users/contact-us
//@descrption      inquiry from user | anonymous user
//@access         Public
router.post('/contact-us', async (req, res) => {
  try {
    let {subject, message, name, email, phone} = req.body;

    // send mail with your feedback or inquiry to soul-team
    await transport.sendMail({
      from: `User-Inquiry`,
      to: process.env.EMAIL_USER, //Soul-team email
      subject: subject,
      html: contactUs(name, message, email, phone),
    });

    res.status(200).json({msg: 'You message has been sent successfully'});
  } catch (error) {
    console.log(err.message);
    res.status(400).json({errors: [{msg: 'Message failed'}]});
  }
});

module.exports = router;
