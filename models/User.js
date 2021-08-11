const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    userImg: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    dob: {
      type: String,
    },

    wallet: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Active'],
      default: 'Pending',
    },

    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
      },
    ],
  },
  {timestamps: true}
);

module.exports = mongoose.model('user', UserSchema);
