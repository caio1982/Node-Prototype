// Winston logging support
var log = require('../log')(module);

// Simple validators
validate = require('mongoose-validator').validate;
var usernameValidator = [validate('len', 5, 25), validate('isAlphanumeric'), validate('isLowercase')];
var nameValidator = [validate('len', 5, 50)];

// Salted hashing for passwords in DB
bcrypt = require('bcrypt');

module.exports = function(){
	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var userModel = new Schema({
		username: {
			validate: usernameValidator,
			type: String,
			required: true,
			trim: true,
			index: {
				unique: true
			}
		},
		// Automatically populated
		created: {
			type: Date,
			default: Date.now,
			required: false
		},
		// To be updated by bcrypt
		password: {
			type: String,
			trim: true,
			required: true
		},
		// To be updated by bcrypt
		salt: {
			type: String,
			required: false
		},
		name: {
			validate: nameValidator,
			type: String,
			trim: true,
			required: true
		},
		locked: {
			type: Boolean,
			required: true
		},
		role: {
			type: String,
			enum: ['admin', 'user'],
			required: true
		}
	});

	// Called before every save (not updates?)
	userModel.pre('save', function(next) {
		// Copy 'this' since we can't update it directly
		var that = this;

		// Hash it only if it hasn't been modified or if it's a new record
		if (!that.isModified('password')) {
			return next();
		}

		// Salts over 10 factor seem not to work correctly?
		bcrypt.genSalt(10, function(err, salt) {
			if (err) {
				log.error('Password salting failed: ' + err);
				return next(err);
			}
			bcrypt.hash(that.password, salt, function(err, hash) {
				if (err) {
					log.error('Password hashing failed: ' + err);
					return next(err);
				}
				// Stores the updated password data
				that.password = hash;
				that.salt = salt;
				next();
			});
		});
	});

	userModel.methods.comparePassword = function(candidatePassword, storedPassword, callback) {
		bcrypt.compare(candidatePassword, storedPassword, function(err, isMatch) {
			if (err) {
				// This is actually logged first by server.js
				log.warn('Password mismatch: ' + candidatePassword);
				return callback(err);
			}
			// Ok, good to go
			callback(null, isMatch);
		});
	};

	return mongoose.model('users', userModel);
};
