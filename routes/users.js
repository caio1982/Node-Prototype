module.exports = function(app) {

	var users = app.controllers.users;
	var passport = require('passport');
	var credentials = passport.authenticate('basic', {session: false});

	// Lists
	app.get('/api/users', credentials, users.index);
	app.get('/api/users/:id', credentials, users.get);

	// Modifies
	app.post('/api/users', credentials, users.post);
	app.put('/api/users/:id', credentials, users.put);

	// Removes
	app.delete('/api/users/:id', credentials, users.delete);
};
