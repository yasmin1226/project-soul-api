///experience
//@route PUT api/profile/experience
//@descrption PUT therapist experiencs
//@ access private
//const jwt = require("jsonwebtoken");
// const config = require('config');
const Therapist = require("../models/TherapistModel");

// module.exports.updateExperince = async (req, res) => {
//   const id = req.params.id;
//   const { title, location, from, to } = req.body;

//   const newExperience = { title, location, from, to };
//   console.log("new", newExperience);
//   try {
//     const therapist = await Therapist.findById(id); //req.therapsitId
//     console.log("th", therapist);
//     therapist.experience.unshift(newExperience);
//     await therapist.save();
//     res.json({ therapist });
//   } catch (err) {
//     console.error("err", err);
//     res.status(500).send("server error");
//   }
// };
module.exports.updateExperience = async (req, res) => {
  try {
    const id = req.params.id;

    const therapist = await Therapist.findOne({ _id: id });

    //therapist.experience.unshift(req.body);

    if (therapist) {
      therapist.experience.unshift(req.body);
      await therapist.save();
      res.status(200).json({ therapist });
    } else {
      throw Error("that Therapist not exist");
    }

    // res.json({ therapist });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports.deleteExperience = async (req, res) => {
  const exp_id = req.params.exp_id;
  console.log(exp_id);
  console.log(req.therapistId);
  try {
    const therapist = await Therapist.findOne({ _id: req.therapistId });
    console.log("ther", therapist);

    therapist.experience = therapist.experience.filter(
      (exp) => exp._id.toString() !== exp_id
    );

    await therapist.save();
    console.log("thh", therapist);
    console.log("save");
    return res.status(200).json({ therapist });

    //res.send(therapist);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ err: "Server error" });
  }
};

module.exports.updateEducation = async (req, res) => {
  try {
    const id = req.params.id;

    const therapist = await Therapist.findOne({ _id: id });

    therapist.education.unshift(req.body);

    if (therapist) {
      therapist.education.unshift(req.body);
      await therapist.save();
      res.status(200).json({ therapist });
    } else {
      throw Error("that Therapist not exist");
    }

    // res.json({ therapist });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports.deleteEducation = async (req, res) => {
  const edu_id = req.params.edu_id;
  console.log(edu_id);

  try {
    const therapist = await Therapist.findOne({ _id: req.therapistId });

    // const therapist = await Therapist.findOne({ therapist: req.therapist._id }); //////////////
    console.log("ther", therapist);

    therapist.education = therapist.education.filter(
      (edu) => edu._id.toString() !== edu_id
    );

    await therapist.save();
    console.log("save");
    return res.status(200).json({ therapist });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

module.exports.socialMediaData = async (req, res) => {
  try {
    // Using upsert option (creates new doc if no match is found):
    let therapist = await Therapist.findByIdAndUpdate(req.therapist.Id, {
      socialLinks: req.body,
    });
    console.log("social", therapist);
    // console.log(req.therapistId);

    res.status(200).json({
      status: "sucscess",
    });
  } catch (err) {
    console.error("errrmee", err.message);
    res.status(500).json({ err: "Server Error" });
  }
};

module.exports.getmyprofile = async (req, res) => {
  console.log("me");
  try {
    console.log("therapistt", req.therapistId);
    const myprofile = await Therapist.findById(req.therapistId); //req.therapsitId
    console.log("mw", myprofile);
    // res.send("hhhhhhh");

    res.status(200).json({
      status: "sucscess",
      therapist: myprofile,
    });
  } catch (err) {
    console.log(123);
    console.error("err.mess", err.message);
    res.status(500).json({ err });
  }
};

module.exports.updataTherapist = async (req, res) => {
  try {
    // req.body.uploadCv = url;
    // console.log(req.body);
    const therapist = await Therapist.findByIdAndUpdate(
      req.params.id,
      req.body,

      {
        new: true,
        runValidators: true,
      }
    );

    if (therapist) {
      res.status(200).json({
        status: "sucscess",

        therapist: therapist,
      });
    } else {
      throw Error("that Therapist not exist");
    }
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};
