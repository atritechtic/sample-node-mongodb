const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new mongoose.Schema({
	text: {
		type: String,
	},
	date_created: {
		type: Date,
		default: Date.now,
	},
	serviceId: {
		type: Schema.Types.ObjectId,
		ref: 'service',
	},
	service: {
		type: Object,
		required: true,
	},
	start_date: {
		type: Date,
		required: true,
	},
	start_time: {
		type: Date,
		required: true,
	},
	duration: {
		type: Number,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user',
	},
	companyId: {
		type: Schema.Types.ObjectId,
		ref: 'company',
	},
	company: {
		type: Object,
		required: true,
	},
	user_calender: {
		type: String
	},
	business_calender: {
		type: String
	},
	comments: [
		{
			user: {
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
			company: {
				type: Schema.Types.ObjectId,
				ref: 'company',
			},
			company_user: {
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
			text: {
				type: String,
				required: true,
			},
			name: {
				type: String,
			},
			avatar: {
				type: String,
			},
			date: {
				type: Date,
				default: Date.now,
			},
			attachments: {
				type: Object
			},
		},
	],
	intakeForm: [
		{
			formfield: {
				type: Schema.Types.ObjectId,
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
			option:[
				{
					lable: {
						type: String
					},
					value: {
						type: String
					}
				}
			],
		},
	],
});

module.exports = Booking = mongoose.model('booking', BookingSchema);
