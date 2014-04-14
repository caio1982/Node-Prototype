// Winston logging support
var log = require('../log')(module);

exports.index = function(req, res, next) {
	var userModel = req.app.models.users;
	userModel.find(function(err, users) {
		if (!err) {
			res.json(users);
		} else {
			log.error('Get all failed: ' + err);
			res.send(500);
		}
	});
};

exports.get = function(req, res, next) {
	var userModel = req.app.models.users;
	userModel.findById(req.params.id, function(err, users) {
		if (!users) {
			log.warn('Record not found: ' + req.params.id);
			res.json(404);
		}

		if (!err) {
			res.json(users);
		} else {
			log.error('Get by ID failed: ' + err);
			res.send(500);
		}
	});
};

exports.post = function(req, res, next) {
	var userModel = req.app.models.users;
	var newUser = new userModel({
		username: req.body.username,
		password: req.body.password,
		name: req.body.name,
		role: req.body.role,
		locked: req.body.locked
	});

	newUser.save(function(err, user) {
		if (!err) {
			res.json(user);
		} else {
			log.error('Post save failed: ' + err);
			res.send(500);
		}
	});
};

exports.put = function(req, res, next) {
	var userModel = req.app.models.users;
	userModel.findById(req.params.id, function(err, user) {
		if (!user) {
			log.warn('Record to update not found: ' + req.params.id);
			res.json(404);
		}

		user.username = req.body.username;
		user.locked = req.body.locked;
		user.password = req.body.password;
		user.name = req.body.name;
		user.role = req.body.role;

		user.save(function(err) {
			if (!err) {
				res.send(200);
			} else {
				log.warn('Conflict, record exists? ' + err);
				res.send(409);
			}
		});
	});
};

exports.delete = function(req, res, next) {
	var userModel = req.app.models.users;
	userModel.findById(req.params.id, function(err, user) {
		if (!user) {
			log.warn('Record for removal not found: ' + req.params.id);
			res.json(404);
		} else {
			user.remove(function(err) {
				if (!err) {
					res.send(204);
				} else {
					log.error('Post removal failed: ' + err);
					res.send(500);
				}
			});
		}
	});
};
