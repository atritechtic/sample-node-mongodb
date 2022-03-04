const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  prefix: {
    type: String,
  },
  suffix: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  bio: {
    type: String,
  },
  social: {
      facebook: {
        type: String,
      },
      instagram: {
        type: String,
      },
      twitter: {
        type: String,
      },
      linkedin: {
        type: String,
      },
  },
  experiences: [
    {
      title: {
        type: String,
      },
      company: {
        type: String,
      },
      location: {
        type: String,
      },
      from: {
        type: String,
      },
      to: {
        type: String,
      },
      current: {
        type: Boolean,
      },
      desc: {
        type: String,
      },
    },
  ],
  insurance: [
    {
      company: {
        type: String,
      },
      policy_num: {
        type: String,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
