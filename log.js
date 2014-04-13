var winston = require('winston');

function getLogger(module) {
	return new winston.Logger({
		transports: [
			new(winston.transports.File)({
				filename: 'server.log',
				handleExceptions: true
			}),
			new winston.transports.Console({
				colorize: true,
				level: 'debug'
			})
		]
	});
}

module.exports = getLogger;
