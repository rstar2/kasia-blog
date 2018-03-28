// configure the express-session middleware
// see https://github.com/expressjs/session for more session options
module.exports = function (keystone) {
	const env = keystone.get('env');

	let maxAge;
	switch (env) {
		case 'production':
			// store the session in the Mongo DB, not in memory
			// requires "npm install connect-mongo --save"
			console.log('Production mode - Use session store - MongoStore');
			keystone.set('session store', 'connect-mongo');

			maxAge = 180 * 60 * 1000; // 3 hours
			break;
		case 'development':
			maxAge = 10 * 60 * 1000; // 3 minutes
			break;
	}

	keystone.set('session options', {
		cookie: { maxAge },
	});
};
