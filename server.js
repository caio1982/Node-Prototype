// Winston logging support
var log = require('./log')(module);

// Passport's module configuration for auth strategies.
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

// Basic username:password checks
passport.use(new BasicStrategy(function(username, password, done) {
	var foundUsername = app.models.users.findOne({
		username: username
	}, function(err, res) {
		// Any problem found? Denied!
		if (err) {
			log.error('Access denied, error: ' + username);
			return done(null, false);
		}
		// No results from DB? Denied!
		if (!res) {
			log.warn('Access denied, unknown: ' + username);
			return done(null, false);
		}
		// If this user's not locked in the DB...
		if (res.locked === false) {
			// Check passed and stored hashes
			res.comparePassword(password, res.password, function(err, res) {
				// Any problem found? Denied!
				if (err) {
					return done(null, false);
				}
				// They match, access granted
				if (res === true) {
					return done(null, true);
				}

				// All other cases, denied!
				log.info('Access denied, credentials: ' + username);
				return done(null, false);
			});
		} else {
			// Otherwise, denied!
			log.info('Access denied, locked: ' + username);
			return done(null, false);
		}
	});
}));

// The web framework itself
var express = require('express');
var app = express();

//  Standard & common express() setup
app.use(express.cookieParser()); // To be replaced by the cookies module
app.use(express.session({secret: '1234567890', key: 'express.sid'})); // FIXME: insecure secret key
app.use(express.methodOverride()); // Connect's faux PUT and DELETE support
app.use(passport.initialize()); // Attaches the basic auth support
app.use(express.urlencoded());
app.use(express.json());
app.use(app.router);

// Mongo database support
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/prototype-node', function(err) {
	if (err) {
		log.error('Database not ready! ' + err);
	}
});

// Generic database monitoring
var db = mongoose.connection;

db.on('error', function(err) {
  log.error('Connection error: ' + err);
});

db.once('open', function callback() {
  log.info('Connected to database');
});

 // Static files serving (files inside this folder are visible from site root)
var path = require('path');
app.use(express.static(path.join(__dirname, "public")));

// Generic handler for unmapped routes
app.use(function(req, res) {
	log.info('Not found: ' + req.path);
	res.send(404);
});

// Generic handler for internal server errors
app.use(function(err, req, res, next) {
	log.error('Internal server error: ' + err);
	res.send(500);
});

// MVC module config (after all the rest, otherwise it may fail)
var load = require('express-load');
load('models').then('controllers').then('routes').into(app);

// HTTPS only, certificates should not be self-signed in production.
var fs = require('fs');
var https = require('https');
var httpsPrivateKey = fs.readFileSync('./certs/server.key', 'utf8');
var httpsCertificate = fs.readFileSync('./certs/server.pem', 'utf8');
var httpsCredentials = {key: httpsPrivateKey, cert: httpsCertificate};

// Attach the app object to the HTTPS server creation
var httpsServer = https.createServer(httpsCredentials, app);

// Actual start of the server, local HTTPS port during development
httpsServer.listen(8443);
