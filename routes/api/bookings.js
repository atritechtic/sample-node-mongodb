const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const moment = require('moment');

const Booking = require('../../models/Booking');
const User = require('../../models/User');

// @route   GET api/bookings
// @desc    Get all users bookings
// @access  Public
router.get('/', auth, async (req, res) => {
	try {
		const today = moment();

		const bookings = await Booking.find({
			user: req.user.id,
			start_date: { $gte: today.toDate() },
		})
			.populate('user', ['email', 'firstName', 'lastName', 'phone'])
			.sort({ start_date: -1 });

		res.json(bookings);
	} catch (error) {
		res.status(500).send('Server Error');
		console.log(error);
	}
});

// @route   GET api/bookings/past
// @desc    Get all users bookings
// @access  Public
router.get('/past', auth, async (req, res) => {
	try {
		const today = moment();

		const pastbookings = await Booking.find({
			user: req.user.id,
			start_date: { $lte: today.toDate() },
		})
			.populate('user', ['email', 'firstName', 'lastName', 'phone'])
			.sort({ start_date: -1 });

		res.json(pastbookings);
	} catch (error) {
		res.status(500).send('Server Error');
	}
});

// @route   GET api/bookings
// @desc    Get all users bookings
// @access  Public
router.get('/mine', auth, async (req, res) => {
	try {
		const bookings = await Booking.find({ user: req.user.id })
			.populate('user', ['email', 'firstName', 'lastName', 'phone'])
			.sort({
				start_date: -1,
			});

		res.json(bookings);
	} catch (error) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/bookings/:id
// @desc    Get booking by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id).populate('user', [
			'email',
			'firstName',
			'lastName',
			'phone',
			'googleAuth',
			'googleUser'
		]);

		if (!booking) {
			return res.status(404).json({ msg: 'Booking not found' });
		}

		res.json(booking);
	} catch (error) {
		console.error(err.message);

		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route   POST api/bookings
// @desc    Add new bookings
// @access  Private
router.post('/', [auth], async (req, res) => {
	const { service, start_time, start_date, company, duration, text } =
		req.body;

	try {
		const user = await User.findById(req.user.id).select('-password');

		const booking = new Booking({
			user: user,
			text: text,
			companyId: company,
			company: company,
			serviceId: service,
			service: service,
			start_time: start_time,
			start_date: start_date,
			duration: duration,
		});

		await booking.save();

		res.json(booking);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}

	// res.send('Add bookings');
});

// @route   PUT api/bookings/:id
// @desc    Update bookings
// @access  Private

router.put('/:booking_id',auth, async (req, res) => {
	try {
		// update booking 
		let bookingDetails = await Booking.findOne({ _id: req.params.booking_id });
		console.log('bookingDetails',bookingDetails)
		let updateData = req.body;
		if(updateData.business_calender){
			bookingDetails.business_calender = updateData.business_calender;
		}
		if(updateData.user_calender){
			bookingDetails.user_calender = updateData.user_calender;
		}
		await bookingDetails.save();

		res.json({ msg: 'Booking updated!' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Booking Deletion Server Error');
	}
});

// @route   DELETE api/bookings/:id
// @desc    Delete bookings
// @access  Private
router.delete('/:booking_id', auth, async (req, res) => {
	try {
		// Remove company
		await Booking.findOneAndRemove({ _id: req.params.booking_id });

		res.json({ msg: 'Booking deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Booking Deletion Server Error');
	}
});

// @route   POST api/bookings/comment/:id
// @desc    Add a comment to a post
// @access  Private
router.post(
	'/comment/:id',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return rses.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			const booking = await Booking.findById(req.params.id).populate(
				'user',
				['email', 'firstName', 'lastName']
			);

			const newComment = {
				text: req.body.text,
				attachments: req.body.UploadImage,
				name: user.firstName + ' ' + user.lastName,
				avatar: user.avatar,
				user: user,
			};

			booking.comments.push(newComment);

			await booking.save();

			res.json(booking);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error Comment Error');
		}
	}
);

// @route   DELETE api/bookings/comment/:id/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);

		//pull out comment
		const comment = booking.comments.find(
			comment => comment.id === req.params.comment_id
		);

		// Make sure comment exists
		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' });
		}

		// Check user
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		// Get the remove index
		const removeIndex = booking.comments
			.map(comment => comment.user.toString())
			.indexOf(req.user.id);

		booking.comments.splice(removeIndex, 1);

		await booking.save();

		res.json(booking.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Comment Server Error');
	}
});

module.exports = router;
