const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new mongoose.Schema(
{
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user',
	},
	name: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	website: {
		type: String,
	},
	description: {
		type: String,
	},
	phone: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	fax: {
		type: String,
	},
	likes: [
		{
			user: {
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
		},
	],
	geolocation: {
		type: {
			type : String
		},
		coordinates: Array,
	},
	location: {
		country: {
			type: String,
			required: false,
		},
		street_address: {
			type: String,
			required: true,
		},
		street_address_2: {
			type: String,
		},
		city: {
			type: String,
			required: true,
		},
		province: {
			type: String,
			required: false,
		},
		postal: {
			type: String,
		},
		lat: {
			type: Number,
		},
		lng: {
			type: Number,
		},
	},
	geoLocation:{
		type:{
			type:String,
		},
		coordinates:{
			type:Array
		}
	},
	is_admin: {
		type: Boolean,
		default: false
	},
	services: [
		{
			name: {
				type: String,
				required: true,
			},
			description: {
				type: String,
			},
			service_duration: {
				type: Number,
				default: 60,
			},
			price: {
				type: String,
			},
			book_online: {
				type: Boolean,
			},
			call_to_book: {
				type: Boolean,
			},
			book_site: {
				type: Boolean,
			},
			book_site_link: {
				type: String,
			},
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
					is_required: {
						type: Boolean,
						default: false,
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
		},
	],
	social: {
		facebook: {
			type: String,
		},
		twitter: {
			type: String,
		},
		linkedin: {
			type: String,
		},
		instagram: {
			type: String,
		},
	},
	store_hours: {
		Sunday: {
			type: Object,
		},
		Monday: {
			type: Object,
		},
		Tuesday: {
			type: Object,
		},
		Wednesday: {
			type: Object,
		},
		Thursday: {
			type: Object,
		},
		Friday: {
			type: Object,
		},
		Saturday: {
			type: Object,
		},
	},
	reviews: [
		{
			user: {
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
		},
	],
	date_created: {
		type: Date,
		default: Date.now,
	},
});
CompanySchema.index({ geolocation: '2dsphere' });

module.exports = Company = mongoose.model('company', CompanySchema);
