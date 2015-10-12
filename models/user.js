var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: String,
	email: String,
	twitter: String,
	github: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;