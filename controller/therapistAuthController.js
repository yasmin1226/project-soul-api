const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Therapist = require('../models/TherapistModel');
const APIFeatures = require('../utils/APIFeatures');
//const sendEmail = require("../utils/email");
const { transport } = require('../utils/emails/nodemailer.config');
const { confirmEmail } = require('../utils/emails/confirm');
const { resetPassword } = require('../utils/emails/reset-password');

const handleErrors = (err) => {
  let errors = {
    // fname: "",
    // lname: "",
    // email: "",
    // password: "",
    // confirmPassword: "",
  };
  //duplicateerror code
  if (err.code === 11000) {
    errors.err = 'email already exist..';
    return errors;
  }

  if (err.message.includes('you are not allowed to log in now')) {
    errors.err = 'you are not allowed to log in nowd';
  }
  //incorrect email or password
  if (err.message.includes('incorrect email or password')) {
    errors.err = 'incorrect email or password';
  }
  if (err.message.includes('password are not the same')) {
    errors.err = 'password are not the same';
  }
  if (err.message.includes('token is invaled or has expired')) {
    errors.err = 'token is invaled or has expired';
  }
  if (err.message.includes('please confirm your email')) {
    errors.err = 'please confirm your email';
  }

  if (err.message.includes('there is no user with email address')) {
    errors.err = 'there is no user with email address';
  }
  if (err.message.includes('password are not the same')) {
    errors.err = 'password are not the same';
  }
  if (err.message.includes('Your current password is wrong')) {
    errors.err = 'Your current password is wrong';
  }

  //validation errors
  if (err.message.includes('Therapist validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  } else {
    errors.err = err.message;
  }

  return errors;
};
const createToken = (id) => {
  //id
  const payload = {
    therapistId: id,
  };
  // const maxAge = Date.now() + 3 * 24 * 60 * 60;

  return jwt.sign(payload, 'mySecretJWT', {
    expiresIn: 36000,
  });
};

module.exports.signup_post = async (req, res) => {
  const { fname, lname, email, password, confirmPassword } = req.body;
  try {
    const therapist = await Therapist.create({
      fname,
      lname,
      email,
      password,
      confirmPassword,
    });
    const token = createToken(therapist._id);
    console.log('token', token);

    // const message = "please verfiy ypur account ";
    // const options = {
    //   email: req.body.email,
    //   subject: "verify your account",
    //   message,
    // };
    // await sendEmail(options);
    // res.status(201).json({ token });
    const confirmLink = `${process.env.API_URI}/api/therapist/confirm-therapist-email/${token}`;
    console.log('confirm', confirmLink);
    //send email to complete regiseration
    await transport.sendMail({
      from: `Soul-Team 👻 <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Please confirm your account',
      html: confirmEmail(fname, email, confirmLink),
    });

    res.status(200).json({ status: therapist.status });
  } catch (err) {
    console.log('catch');console.log("err",err)
    const errors = handleErrors(err);
    // console.log(err);
    res.status(400).json({ errors });
  }
};

module.exports.confirmTherapistEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { therapistId } = await jwt.verify(token, 'mySecretJWT');
    console.log('therapost', therapistId);
    //    console.log("res", result);
    const therapist = await Therapist.findById(therapistId).select('-password');
    if (!therapist) {
      return res.status(404).send({ msg: 'therapist Not found.' });
    }

    //update user email status to active
    therapist.status = 'Active';
    await therapist.save();
    //redirect to a verified email page after email verified to login into the website as verified account
    res
      .status(200)
      .redirect(
        `${process.env.FRONTEND_URI}/therapist-data-form/${therapist._id}`
      );
  } catch (err) {
    console.log(err.message);
    const errors = handleErrors(err);

    res.status(500).send('Server error');
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const therapist = await Therapist.login(email, password);
    const token = createToken(therapist._id);

    res.status(200).json({ token });
  } catch (err) {
    //const errors = handleErrors(err);
    console.log('catch');
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {};
module.exports.forgotPassword = async (req, res) => {
  try {
    console.log('forget');
    //get user baset on posted email
    const therapist = await Therapist.findOne({ email: req.body.email });
    if (!therapist) {
      throw Error('there is no user with email address');
    }
    //generateToken
    const resetToken = therapist.createPasswordResetToken();
    console.log('resttoke', resetToken);
    await therapist.save({ validateBeforeSave: false });
    // res.status(200).json({ resetToken });

    // //send email

    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/therapist/resetpassword/${resetToken}`;
    // console.log(resetURL);
    // const message = `Forget ypur password ? dubmti a request with your new password and confirm to :
    //   ${resetURL}.\n if you didnt forget please ignore email`;
    // await sendEmail({
    //   email: req.body.email,
    //   subject: "your passwud reset token in 10 min",
    //   message,
    // });
    const resetPasswordLink = `${process.env.FRONTEND_URI}/therapist-reset-password/${resetToken}`; //front

    // send mail with the reset password link
    await transport.sendMail({
      from: `Soul-Team  <${process.env.EMAIL_USER}>`,
      to: req.body.email,
      subject: 'Password Reset',
      html: resetPassword(therapist.fname, resetPasswordLink),
    });
    res
      .status(200)
      .json({ msg: 'Reset password resquest has been sent successfully' });
    // res.status(200).json({
    //   status: "sucss",
    //   message,
    // });
  } catch (err) {
    console.log('errr', err);
    // therapist.passwordResetToken = undefined;
    //therapist.passwordResetExpires = undefined;
    const errors = handleErrors(err);
    // console.log(err);
    res.status(400).json({ errors });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    console.log('re', req.body);
    //get user based on token
    console.log('reset');
    const hasedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const therapist = await Therapist.findOne({
      passwordResetToken: hasedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //if token has not expires and ther ie a user  set new password
    if (!therapist) {
      console.log('no therapist');
      throw Error('token is invaled or has expired');
      // res.status(400).json({ err: "token is invaled or has expired" });
    } else {
      console.log('Therapist');
      therapist.password = req.body.password;
      therapist.confirmPassword = req.body.confirmPassword;
      therapist.passwordResetToken = undefined;
      therapist.passwordResetExpires = undefined;
      await therapist.save();
      //update changef password At
      //log ther usrt in send jwt

      const token = createToken(therapist._id);
      console.log('token', therapist);
      res.status(200).json({ token });
    }
  } catch (err) {
    const errors = handleErrors(err);

    res.status(400).json({ errors, err });
  }
};

module.exports.updatePassword = async (req, res) => {
  const { password, confirmPassword, currentPassword } = req.body;
  //get user
  try {
    const therapist = await Therapist.findById(req.therapistId).select(
      '+password'
    );
    //check if current pass is correct
    if (
      !(await therapist.correctPassword(
        req.body.currentPassword,
        therapist.password
      ))
    ) {
      throw Error('Your current password is wrong', 401);
      //if correct
    }
    therapist.password = req.body.password;
    therapist.confirmPassword = req.body.confirmPassword;
    await therapist.save();
    //log in password send jwt
    const token = createToken(therapist._id);
    res.status(200).json({
      status: 'sucess',
      token,
    });
  } catch (err) {
    const errors = handleErrors(err);
    // console.log(err);
    res.status(400).json({ errors });
  }
};

module.exports.aliasTopRatedTherapist = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage';

  //req.query.fields = "fname,lname,ratingsQunatity,ratingsAverage";
  next();
};
module.exports.getAllTherapists = async (req, res) => {
  try {
    const features = new APIFeatures(Therapist.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const therapists = await features.query;
    //send response

    res.status(200).json({
      status: 'sucscess',
      results: therapists.length,
      therapists: therapists,
    });
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};

module.exports.getOneTherapist = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id)
      .populate('reviews')
      .populate('appointments')
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
    if (!therapist) {
      throw Error('that Therapist not exist');
    }
    //sort appointments ascending by date
    if (therapist.appointments.length > 0) {
      therapist.appointments.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    }

    res.status(200).json({
      status: 'sucscess',
      therapist: therapist,
    });
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};

module.exports.loadTherapist = async (req, res) => {
  // console.log(req.therapistId);
  try {
    const therapist = await Therapist.findById(req.therapistId)
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
    if (!therapist) {
      throw Error('that Therapist not exist');
    }
    res.status(200).json(therapist);
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};

module.exports.updataTherapist = async (req, res) => {
  try {
    console.log(
      '------------------------------------------- HERE -------------------------------'
    );
    console.log(req.body)
    let url = '';
    if (!req.body.data) {
      url = '';
    } else {
      //cloudinary image upload

      const fileStr = req.body.data;
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: 'soul',
      });
      console.log(uploadedResponse);
      url = uploadedResponse.secure_url;
    }
    // req.body.uploadCv = url;
    // console.log(req.body);
    console.log(req.body);
    const therapist = await Therapist.findByIdAndUpdate(
      req.params.id,

      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // const therapist = await Therapist.findOneAndUpdate(
    //   { _id: req.params.id },
    //   { $set: req.body },
    //   { new: true }
    // );

    if (therapist) {
      res.status(200).json({
        status: 'sucscess', // message:"Updated sucessfully "
        success: true,
        therapist: therapist,
      });
    } else {
      throw Error('that Therapist not exist');
    }
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res
      .status(400)
      .json({ errors, message: 'Unable to update Therapist', success: false });
  }
};

module.exports.deleteTherapist = async (req, res) => {
  try {
    const therapist = await Therapist.findByIdAndDelete(req.params.id);
    if (therapist) {
      res.status(200).json({
        status: 'sucscess',

        therapist: therapist,
      });
    } else {
      throw Error('that Therapist not exist');
    }
    throw Error('that Therapist not exist');
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};
