const mongoose = require('mongoose');
const BaseSchema = require('./base/BaseSchema.js');

// Define enums
const STATUS = {
  NO_ONBOARDING: 'NO_ONBOARDING',
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  LOCK: 'LOCK',
  BAN: 'BAN'
};

const ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

const UserSchema = new BaseSchema({
  userId: {
    type: Number,
    require: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },  
  fullName: {
    type: String,
    trim: true
  },

  bio: {
    type: String,
    trim: true
  },

  location: {
    type: String,
    trim: true
  },

  learningLanguageId: {
    type: Number,
    require: true
  },

  nativeLanguageId: {
    type: Number,
    require: true
  },

   nativeLanguageName: {
    type: String,
    trim: true
  },

  learningLanguageName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  bucket: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(STATUS),
    required: true,
  },
  
  role: {
    type: String,
    enum: Object.values(ROLE),
    required: true,
  },
  maxLimitResourceMedia: {
    type: Number,
    default: 0,
  },
  currentUsageResourceMedia: {
    type: Number,
    default: 0,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  
  deleted: {
    type: Number,
    default: 0,
  },
  
  rowVersion: {
    type: Number,
    default: 0
  },
}, { 
  collection: 'users',
  timestamps: true 
});


const User = mongoose.model('User', UserSchema);

module.exports = User;