var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	github: {
		id: String,
		token: String,
		email: String
	},
	twitter: {
		id: String,
		token: String,
		email: String
	}
});

var User = mongoose.model('User', userSchema);

module.exports = User;