const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FormfieldSchema = new mongoose.Schema({
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
	default_value: {
		type: Object,
	},
	is_required: {
		type: Boolean,
		default:false
	},
});

module.exports = mongoose.model('formfields', FormfieldSchema);