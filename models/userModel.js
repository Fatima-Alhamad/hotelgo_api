const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'first name is required'],
    minlength: [4, `name should be greater than 4 characters`],
    maxlength: [30, `name should be less than 30 character`],
  },
  lastName: {
    type: String,
    required: [true, 'last name is required'],
    minlength: [4, `name should be greater than 4 characters`],
    maxlength: [30, `name should be less than 30 character`],
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    validate: [validator.isEmail, 'please enter valid email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password '],
    validate: {
      // works only on SAVE!
      validator: function (value) {
        return value === this.password;
      },
      message: `the passwords are not the same`,
    },
  },
  phoneNumber: { type: String },
  bookingHistory: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],

  role: {
    type: String,
    enum: {
      values: ['customer', 'admin', 'host'],
      required: [true, 'user role is required '],
      default: 'customer',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetTokenExpires: { type: Date },
});
userSchema.pre('save', async function (next) {
  // if the password is not modified go to next middleware and don't encrypt the password
  if (!this.isModified('password')) return next();
  // hash the password if its modified
  this.password = await bcrypt.hash(this.password, 12);
  // remove the field confirm password from the database
  this.confirmPassword = undefined;
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
// to filter the query (prevent displaying inactive users)
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// instance method to check if the password that provide in the login is correct :
userSchema.methods.correctPassword = async function (
  enteredPassword,
  userPassword
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTIssuedAt) {
  if (this.passwordChangedAt) {
    let parsePasswordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    return parsePasswordChangedAt > JWTIssuedAt;
  }
  // password doesn't changed
  return false;
};

// instance method to generate new reset pass token :
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
