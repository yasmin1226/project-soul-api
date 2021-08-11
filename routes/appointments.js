const express = require('express');
const router = express.Router();
require('dotenv').config();
const {check, validationResult} = require('express-validator');

const {userAuth} = require('../middlewares/auth');
const {therapistAuth} = require('../middlewares/therapistAuthMiddleware');

const User = require('../models/User');
const Therapist = require('../models/TherapistModel');
const Appointment = require('../models/Appointment');

const jwt = require('jsonwebtoken');
const axios = require('axios');

const payload = {
  iss: process.env.APIKey,
  exp: new Date().getTime() + 5000,
};
const ZOOM_TOKEN = jwt.sign(payload, process.env.APISecret);

//************************************ Therapist appointments CRUD  operation ************************* *//

//@ route         GET api/appointments/therapist
//@descrption      get therapist's appointments
//@access          Puplic
router.get('/therapist/:therapist_id', async (req, res) => {
  const {therapist_id} = req.params;
  try {
    //get all the appointments for this therapist
    const appointments = await Appointment.find({
      therapist: therapist_id,
    });
    //.populate('therapist');

    if (!appointments) {
      return res
        .status(400)
        .send({msg: 'There are no appointments for this therapist'});
    }
    res.status(200).send(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@ route         POST api/appointments/
//@descrption      create therapist's appointments
//@access          private
router.post('/', therapistAuth, async (req, res) => {
  try {
    const {date, from, to, ...rest} = req.body;

    const therapist = await Therapist.findById(req.therapistId).populate(
      'appointments'
    );

    if (!therapist || !date || !from || !to) {
      return res
        .status(400)
        .send({msg: 'Please fill out all the required data'});
    }

    //check for appointment if already exists
    if (
      therapist.appointments.filter(
        (app) => app.date === date && app.from === from && app.to === to
      ).length > 0
    ) {
      return res.status(400).send({msg: 'This appointment already exists'});
    }

    /*new Intl.DateTimeFormat("en" , { 
  timeStyle: "short"
}).format(new Date(`2021-7-1 ${time} `))*/

    // const timeFormatter = (date, time) =>
    //   new Intl.DateTimeFormat('en', {
    //     timeStyle: 'short',
    //   }).format(new Date(`${date} ${time}`));

    //zoop api
    let axios_options = {
      url: `https://api.zoom.us/v2/users/${process.env.ZOOM_EMAIL}/meetings/`,
      method: 'post',

      headers: {
        Authorization: `Bearer ${ZOOM_TOKEN}`,
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json',
      },
      options: {
        status: 'active',
      },
      json: true,

      data: {
        timezone: 'Africa/Cairo',
        start_time: `${date}T${from}:00`,
        duration: 120,
        settings: {
          join_before_host: true,
        },
      },
    };

    const response = await axios(axios_options);
    console.log(response.data);
    let link = response.data.join_url;

    const newAppointment = new Appointment({
      therapist: therapist,
      date: date,
      from: from,
      to: to,
      zoomLink: link,
      ...rest,
    });

    //save new appointment to Appointment collection
    await newAppointment.save();
    //save new appointment to therapist
    therapist.appointments.push(newAppointment);
    await therapist.save();
    res.status(200).json(newAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@ route         PUT api/appointments/:appointments_id
//@descrption      edit therapist's appointments
//@access          private
router.put('/:appointment_id', therapistAuth, async (req, res) => {
  const {appointment_id} = req.params;
  const {date, from, to, ...rest} = req.body;
  try {
    const therapist = await Therapist.findById(req.therapistId).populate(
      'appointments'
    );

    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({msg: 'Appointment not found'});
    }

    //check for appointment if already exists
    if (
      therapist.appointments.filter(
        (app) => app.date === date && app.from === from && app.to === to
      ).length > 0
    ) {
      return res.status(400).send({msg: 'This appointment already exists'});
    }
    // const timeFormatter = (date, time) =>
    //   new Intl.DateTimeFormat('en', {
    //     timeStyle: 'short',
    //   }).format(new Date(`${date} ${time}`));

    // build an appointment fields
    const appointmentFields = {
      therapist: therapist,
      date: !date ? appointment.date : date,
      from: !from ? appointment.from : from,
      to: !to ? appointment.to : to,
      ...rest,
    };

    //upsert creates new doc if no match is found
    const updatedAppointment = await Appointment.findOneAndUpdate(
      {_id: appointment_id},
      {$set: appointmentFields},
      {new: true, upsert: true, setDefaultsOnInsert: true}
    );
    res.json(updatedAppointment);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Appointment not found'});
    }
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

//@ route          Delete api/appointments/:appointments_id
//@descrption      Delete  appointment  by id
//@access          Private
router.delete('/:appointments_id', therapistAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointments_id);

    //check appointment
    if (!appointment) {
      return res.status(404).json({msg: 'Appointment not found'});
    }

    //check if therapist is authorized to delete this appointment
    if (appointment.therapist._id.toString() !== req.therapistId) {
      return res.status(401).json({msg: 'Therapist is not authorized'});
    }

    await appointment.remove();

    res.json({msg: 'Appointment removed from schedule'});
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Appointment not found'});
    }

    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

//************************************ Patient/User appointments CRUD operation ************************* *//

//@ route         PUT api/appointments/user/
//@descrption      create user's appointments
//@access          private
// router.put('/user/:appointment_id', userAuth, async (req, res) => {
//   const {appointment_id} = req.params;
//   const {...rest} = req.body;

//   const user = await User.findById(req.user.id);

//   const appointment = await Appointment.findById(appointment_id);
//   if (!appointment) {
//     return res.status(404).json({msg: 'Appointment not found'});
//   }

//   //check if there are appointments for this user
//   if (user.appointments.length === 0) {
//     user.appointment = [];
//   }
//   //check if this appointment is already booked by me
//   // if (
//   //   user.appointments.filter((app) => app._id.toString() === appointment_id)
//   //     .length > 0
//   // ) {
//   //   return res
//   //     .status(400)
//   //     .json({msg: 'Appointment already has been booked by you'});
//   // }

//   //check if this appointment is already booked by another user
//   // if (appointment.booking.isBooked) {
//   //   return res
//   //     .status(400)
//   //     .json({msg: 'Appointment already has been booked by another user'});
//   // }

//   //==>> Before write appointment data in the database, the user must be
//   // directed to payment first********************************************
//   // ********************************************************************
//   //*******************************************************************

//   // build an appointment fields for the user
//   const appointmentFields = {
//     booking: {
//       user: req.user.id,
//       isBooked: true,
//     },
//     ...rest,
//   };

//   try {
//     //upsert creates new doc if no match is found
//     const updatedAppointment = await Appointment.findOneAndUpdate(
//       {_id: appointment_id},
//       {$set: appointmentFields},
//       {new: true, upsert: true, setDefaultsOnInsert: true}
//     );

//     user.appointments.unshift(updatedAppointment);
//     await user.save();

//     res.status(200).json(user);
//   } catch (err) {
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({msg: 'Appointment not found'});
//     }
//     console.error(err.message);
//     return res.status(500).send('Server error');
//   }
// });

//@ route          Delete api/appointments/user/:appointments_id
//@descrption      Delete  appointment  by id
//@access          Private
router.delete('/user/:appointment_id', userAuth, async (req, res) => {
  const {appointment_id} = req.params;
  const {...rest} = req.body;

  const appointment = await Appointment.findById(appointment_id);
  const user = await User.findById(req.user.id);

  try {
    //check appointment
    if (!appointment) {
      return res.status(404).json({msg: 'Appointment not found'});
    }

    //check if User is authorized to cancel this appointment
    if (appointment.booking.user._id.toString() !== req.user.id) {
      return res
        .status(401)
        .json({msg: 'User is not authorized to cancel this appointment'});
    }
    const appointmentFields = {
      booking: {
        user: null,
        isBooked: false,
      },
      ...rest,
    };

    //reset appointment status to be avaialble to be booked by another user
    await Appointment.findOneAndUpdate(
      {_id: appointment_id},
      {$set: appointmentFields},
      {new: true, upsert: true, setDefaultsOnInsert: true}
    );

    //remove the appointment from user model
    //get remove Index
    const removeIndex = user.appointments
      .map((app) => app._id.toString())
      .indexOf(appointment_id);

    user.appointments.splice(removeIndex, 1);

    await user.save();

    res.json({msg: 'Appointment is cancelled', user});
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Appointment not found'});
    }

    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
