const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
const User = require('../../models/User');

// @route   POST api/users/update
// @desc    Update a user
// @access  Public
router.post('/me',
  [
    auth,
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, ...rest } = req.body;

    const userFields = {}
    userFields.email = email;

    try {
      // See if user exists
      let cur_user = await User.findOne({ _id: req.user.id });

      if (cur_user) {

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        
        userFields.password = await bcrypt.hash(password, salt);
        
        cur_user = await User.findOneAndUpdate(
          { _id: req.user.id },
          { $set: userFields },
          { new: true }
        );

        let user = new User(cur_user);
        
        console.log(cur_user);
        await user.save();
        user.password = '';
        return res.json(user);
      }

    } catch (err) {
      console.error(err.message);
      res.status(500).send('User Update Server Error');
    }
  }
);

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Please include a phone number').not().isEmpty(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prefix, firstName, lastName, email, phone, password } = req.body;


    try {
      // See if user exists
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        prefix,
        firstName,
        lastName,
        email : email.toLowerCase(),
        phone,
        avatar,
        password,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '5 days',
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
