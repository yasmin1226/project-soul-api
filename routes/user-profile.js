const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const {userAuth} = require('../middlewares/auth');

const User = require('../models/User');



//@ route         POST api/user-profile/
//@descrption      create or update user's profile
//@access          private
router.put('/', userAuth, async (req, res) => {
  let { ...rest} = req.body;

  let loggedUser = await User.findOne({_id: req.user.id});
  if (!loggedUser) {
    return res.status(404).send({message: 'User Not found.'});
  }

  // build a profile
  let profileFields = {
    ...rest,
  };

 
  try {
    //upsert creates new doc if no match is found

    loggedUser = await User.findByIdAndUpdate(
      {_id: req.user.id},
      {$set: profileFields},
      {new: true, upsert: true, setDefaultsOnInsert: true}
    );

    res.status(200).json(loggedUser)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@ route         DELETE api/user-profile
//@descrption      delete profile , user & posts
//@access          private
router.delete('/', userAuth, async (req, res) => {
  try {
    //remove user posts @todo
    // await Post.deleteMany({user: req.user.id});
    //remove user
    await User.findOneAndDelete({_id: req.user.id});

    res.status(200).json({msg: 'User deleted'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
