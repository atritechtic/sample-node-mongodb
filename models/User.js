const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	prefix: {
		type: String,
		required: false,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	phone: {
		type: String,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	resetToken: {
		type: String,
	},
	expireToken: {
		type: Date,
	},
	googleRefreshToken: {
		type: String,
	},
	googleAuth: {
		type: Object,
	},
	googleUser: {
		type: Object,
	},
	googleRefreshTokenBusiness: {
		type: String,
	},
	googleAuthBusiness: {
		type: Object,
	},
	googleUserBusiness: {
		type: Object,
	},
	isAdmin: {
		type: Boolean,
        default: false
	},
	intakeFormFields: [
		{
			formfield: {
				type: String,
				ref: 'formfield',
			},
			field_name: {
				type: String,
				required: true,
			},
			field_label: {
				type: String,
				required: true,
			},
			field_category: {
				type: String,
				default: 'General',
				required: true,
			},
			field_type: {
				type: String,
				default: 'text',
				required: true,
			},
			value: {
				type: Object,
			},
		},
	],
});

module.exports = User = mongoose.model('user', UserSchema);
