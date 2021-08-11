const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'therapist',
    },
    date: {
      type: String,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    fees: {
      type: Number,
      default: 150,
    },
    booking: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null,
      },

      isBooked: {
        type: Boolean,
        default: false,
      },
      isCompeleted: {
        type: Boolean,
        default: false,
      },
      isCancelled: {
        type: Boolean,
        default: false,
      },
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    zoomLink: {
      type: String,
      default: '',
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model('appointment', AppointmentSchema);
