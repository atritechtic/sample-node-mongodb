const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const checkObjectId = require('../../middleware/checkObjectId');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
//const { route } = require('./reviews');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
	try {
		// .populate will bring just the fields we need from another db document
		let profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['firstName', 'lastName', 'phone']);

		if (!profile) {
			let cur_user = await User.findOne({ _id: req.user.id });

			const profileFields = {};

			profileFields.user = cur_user;

			profile = new Profile(profileFields);

			await profile.save();

			profile = await Profile.findOne({
				user: req.user.id,
			}).populate('user', ['firstName', 'lastName', 'phone']);

			res.json(profile);
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Get Me Profile Server Error');
	}
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private
router.post(
	'/',
	[
		auth,
		[
			check('firstName', 'First Name is required').not().isEmpty(),
			check('lastName', 'Last Name is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			prefix,
			suffix,
			firstName,
			lastName,
			phone,
			bio,
			birthday,
			//insurance,
			//social,
			// spread the rest of the fields we don't need to check
			...rest
		} = req.body;

		// Build Profile object
		/*const profileFields = {
      user: req.user.id,
      ...rest
    };*/
		const profileFields = {};
		const userFields = {};

		if (prefix) profileFields.prefix = prefix;
		if (suffix) profileFields.suffix = suffix;
		if (bio) profileFields.bio = bio;
		if (birthday) profileFields.birthday = birthday;
		/*
   if (social)
      profileFields.social = {
        facebook: facebook,
      };
    if (insurance) {
      profileFields.insurance = insurance;
    }*/

		try {
			// Update Database
			let cur_user = await User.findOne({ _id: req.user.id });

			if (firstName) userFields.firstName = firstName;
			if (lastName) userFields.lastName = lastName;
			if (phone) userFields.phone = phone;

			if (cur_user) {
				// Update
				cur_user = await User.findOneAndUpdate(
					{ _id: req.user.id },
					{ $set: userFields },
					{ new: true }
				);
			}
			let user = new User(cur_user);

			await user.save();

			let profile = await Profile.findOne({ user: req.user.id }).populate(
				'user',
				['firstName', 'lastName', 'phone']
			);

			profileFields.user = user;

			if (profile) {
				// Update
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				).populate('user', ['firstName', 'lastName', 'phone']);

				return res.json(profile);
			}

			// Create
			profile = new Profile(profileFields);

			await profile.save();
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [
			'firstName',
			'lastName',
			'phone',
		]);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get(
	'/user/:user_id',
	checkObjectId('user_id'),
	async ({ params: { user_id } }, res) => {
		try {
			const profile = await Profile.findOne({
				user: user_id,
			}).populate('user', [
				'firstName',
				'lastName',
				'phone',
				'googleAuth',
			]);

			if (!profile)
				return res.status(400).json({ msg: 'Profile not found' });

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			if (err.kind == 'ObjectId') {
				return res.status(400).json({ msg: 'Profile not found' });
			}
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/profile
// @desc    Delete profile, user & companies
// @access  Private
router.delete('/', auth, async (req, res) => {
	try {
		// @todo - remove users posts
		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, desc } = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			desc,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experiences.unshift(newExp);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete a profile experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get the remove index
		const removeIndex = profile.experiences
			.map(item => item.id)
			.indexOf(req.params.exp_id);

		profile.experiences.splice(removeIndex, 1);

		await profile.save();

		res.json(profile);
	} catch (err) {
		res.status(500).send('Server Error');
	}
});

module.exports = router;
