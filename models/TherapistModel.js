const crypto = require('crypto');
const mongoose = require('mongoose');
const bycrpt = require('bcryptjs');
const validator = require('validator');
const express = require('express');
const TherapistSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, 'enter first name'],
    },
    lname: {
      type: String,
      required: [true, 'enter last name'],
    },
    email: {
      type: String,
      required: [true, 'enter email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please enter valid email'],
    },
    password: {
      type: String,
      required: [true, 'enter password'],

      select: false,
    },
    confirmPassword: {
      type: String,
      // required: [true, "condirm password"],
      validate: {
        //on create or save
        validator: function (el) {
          return el === this.password;
        },
        message: 'password are not the same..',
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Active'],
      default: 'Pending',
    },
    isAccepted: {
      // type: Boolean,
      // default: false,
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    fees: {
      type: Number,
      default: 150,
    },
    // passwordCgangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    passwordChangedAt: Date,

    ratingsAverage: {
      type: Number,
      // default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must bebelow 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQunatity: {
      type: Number,
      default: 0,
    },

    summary: {
      type: String,
    },
    therapistImg: {
      type: String,
      default: '',
    },

    licenseOfOrganization: {
      type: String,
      // required: true,
    },

    prefix: {
      type: String,
      // required: true,
    },
    yearsofEeperience: {
      type: Number,
      // required: true,
    },
    licenseNo: {
      type: Number,
      // required: true,
    },
    mainsFocus: {
      type: String,
      // required: true,
    },
    birthOfDate: {
      type: Date,
      // required: true,
    },
    specialties: {
      type: String,
      // required: true,
    },
    uploadCv: {
      type: String,
    },

    experience: [
      {
        title: {
          type: String,
          required: true,
        },

        location: {
          type: String,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
        },
      },
    ],
    education: [
      {
        title: {
          type: String,
          required: true,
        },

        location: {
          type: String,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
        },
      },
    ],
    
      twitter: {
        type: String,
      },
      facebook: {
        type: String,
      },
      linkedin: {
        type: String,
      },
      instagram: {
        type: String,
      },
      youtube: {
        type: String,
      },
    
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "review",
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virual
TherapistSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'therapist',
  localField: '_id',
});
TherapistSchema.pre('save', async function (next) {
  const salt = await bycrpt.genSalt();
  //only run if password modified
  if (!this.isModified('password')) return next();
  //hashing bycript with cost of 12
  this.password = await bycrpt.hash(this.password, salt); //defult 10
  this.confirmPassword = undefined;
  next();
});
//instance method
//return true if password is the same
TherapistSchema.methods.correctPassword = async function (
  confirmPassword,
  password
) {
  return await bycrpt.compare(confirmPassword, password);
};

TherapistSchema.statics.login = async function (email, password) {
  const therapist = await this.findOne({ email }).select('+password');
  if (therapist) {
    console.log(therapist);
    if (therapist.status == 'Active') {
      //    if (therapist.isAccepted) {
      const auth = await bycrpt.compare(password, therapist.password);
      if (auth) {
        return therapist;
      } else {
        throw Error('incorrect email or password ');
      }
      // } else {
      //   throw Error("you are not allowed to log in now");
      // }
    } else {
      throw Error('please confirm your email');
    }
  } else {
    throw Error('incorrect email or password');
  }
};
TherapistSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log('rest', resetToken, 'passwordToekn', this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 60 * 1000;

  return resetToken;
};
TherapistSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordCgangedAt = Date.now() - 1000;
  next();
});
const Therapist = mongoose.model('Therapist', TherapistSchema);
module.exports = Therapist;
