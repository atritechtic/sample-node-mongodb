const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const configValue = require('../../config/default.json');
require('dotenv').config();
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const User = require('../../models/User');


require('dotenv').config();

const transporter = nodemailer.createTransport(
	sendGridTransport({
		auth: {
			// api_key: configValue.sendGridAPI,
			api_key: process.env.SEND_GRID_API,
		},
	})
);

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
	'/',
	[
		check('email', 'Please include a value email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;
		try {
			// See if user exists
			let user = await User.findOne({ email: email.toLowerCase() });
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid credentials' }] });
			}

			// Check if passwords match
			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}

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

router.post('/reset', async (req, res) => {
	crypto.randomBytes(32, async (err, buffer) => {
		if (err) {
			console.log(err);
		}
		const token = buffer.toString('hex');
		try {
			let user = await User.findOne({
				email: req.body.email.toLowerCase(),
			});
			if (!user) {
				return res
					.status(422)
					.json({ errors: [{ msg: 'User Does not Exists' }] });
			}
			user.resetToken = token;
			//user can reset their password for only one hour
			user.expireToken = Date.now() + 3600000;
			await user.save();
			process.env.NODE_ENV === 'production'
				? transporter.sendMail({
						to: user.email,
						from: 'info@appointmentcake.com',
						subject: 'Password Reset',
						html: `
          <p>You requested for password reset</p>
          <h5>click in this <a href="https://app.appointmentcake.com/reset/${token}">link</a> to reset password</h5>
          `,
				  })
				: transporter.sendMail({
						to: user.email,
						from: 'info@appointmentcake.com',
						subject: 'password reset',
						html: `
          <p>You requested for Password Reset</p>
          <h5>click in this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h5>
          `,
				  }).then(res=>{console.log('----',res)});

			res.json({ message: 'check your email' });
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	});
});

router.post('/new-password', async (req, res) => {
	const newPassword = req.body.password;
	const sentToken = req.body.token.token;
	try {
		let user = await User.findOne({
			resetToken: sentToken,
			expireToken: { $gt: Date.now() },
		});
		if (!user) {
			return res
				.status(422)
				.json({ errors: [{ msg: 'Try Again Session Expired' }] });
		}
		const salt = await bcrypt.genSalt(10);

		user.password = await bcrypt.hash(newPassword, salt);
		user.resetToken = undefined;
		user.expireToken = undefined;
		user.save();

		res.json({ message: 'Password Has Been Updated' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

router.post('/gtoken', async (req, res) => {
	const gtoken = req.body.googleRefreshToken;
	const gauth = req.body.googleAuth;
	const guser = req.body.googleUser;
	const googleRefreshTokenBusiness = req.body.googleRefreshTokenBusiness;
	const googleUserBusiness = req.body.googleUserBusiness;
	const googleAuthBusiness = req.body.googleAuthBusiness;

	try {
		let user = await User.findOne({
			_id: req.body.user._id,
		});

		if (!user) {
			return res
				.status(422)
				.json({ errors: [{ msg: 'Try Again Session Expired' }] });
		}

		user.googleRefreshToken = gtoken;
		user.googleAuth = gauth;
		user.googleUser = guser;
		user.googleRefreshTokenBusiness = googleRefreshTokenBusiness;
		user.googleUserBusiness = googleUserBusiness;
		user.googleAuthBusiness = googleAuthBusiness;
		user.save();

		res.json({ message: 'Google Authh Token Updated' });
	} catch (err) {
		res.status(500).send('Server Error');
	}
});

router.put('/intakeForm', async (req, res) => {
	const intakeFormData = req.body.intakeForm;
	

	try {
		let  user= await User.findOne({
			_id: req.body.user._id,
		});

		if (!user) {
			return res
				.status(422)
				.json({ errors: [{ msg: 'Try Again Session Expired' }] });
		}

		user.intakeFormFields = intakeFormData;
		user.save();

		res.json({ message: 'user Form Data Updated' });
	} catch (err) {
		res.status(500).send('Server Error');
	}
});

router.put('/gtoken', async (req, res) => {
	console.log(req.body);
	try {
		const gauth = req.body.googleAuth;
		const guser = req.body.googleUser;
		const googleRefreshTokenBusiness = req.body.googleRefreshTokenBusiness;
		const googleUserBusiness = req.body.googleUserBusiness;
		const googleAuthBusiness = req.body.googleAuthBusiness;
		let user = await User.findOne({
			_id: req.body.user._id,
		});

		if (!user) {
			return res
				.status(422)
				.json({ errors: [{ msg: 'Try Again Session Expired' }] });
		}

		user.googleAuth = gauth;
		user.googleUser = guser;
		user.googleRefreshTokenBusiness = googleRefreshTokenBusiness;
		user.googleUserBusiness = googleUserBusiness;
		user.googleAuthBusiness = googleAuthBusiness;

		user.save();

		res.json({ message: 'Google Auth Token Updated' });
	} catch (err) {
		console.log(err);
		res.status(500).send('Server Error');
	}
});
module.exports = router;
