const fs = require('fs');
const path = require('path');
const util = require('util');

const debug = require('debug');
const morganDebug = require('morgan-debug');
const rfs = require('rotating-file-stream');

// configure the morgan logger middleware
// see https://github.com/expressjs/morgan
module.exports = function (keystone) {
	const env = keystone.get('env');
	const logDirectory = keystone.expandPath('logs');
	const logFileAccess = 'access.log';
	const logFileDefault = 'default.log';

	let morganDebugStream, defaultDebugStream;
	switch (env) {
		case 'production': {
			// ensure log directory exists
			fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

			// create a rotating write stream
			morganDebugStream = rfs(logFileAccess, {
				interval: '1d', // rotate daily
				size: '10M', // rotate every 10 MegaBytes written
				maxFiles: 50, // maximum number of rotated files to be kept.
				compress: 'gzip', // compress rotated files
				path: logDirectory,
			});

			defaultDebugStream = rfs(logFileDefault, {
				interval: '1d', // rotate daily
				size: '10M', // rotate every 10 MegaBytes written
				maxFiles: 50, // maximum number of rotated files to be kept.
				compress: 'gzip', // compress rotated files
				path: logDirectory,
			});
			break;
		}
		case 'development': {
			// ensure log directory exists
			fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

			// create a write stream (in append mode)
			morganDebugStream = fs.createWriteStream(path.join(logDirectory, logFileAccess), { flags: 'a' });
			defaultDebugStream = fs.createWriteStream(path.join(logDirectory, logFileDefault), { flags: 'a' });
			break;
		}
	}

	const morganOptions = { stream: morganDebugStream };

	if (process.env.DEBUG_MORGAN === 'true') {
		// replace the default morgan logger with our custom morgan-debug
		const morganFormat = keystone.get('logger');
		keystone.set('logger', null);
		keystone.set('logging middleware',
			morganDebug('app:http', morganFormat || 'combined', morganOptions));
	} else {
		// so the default morgan logger will be used, so just configure it
		keystone.set('logger options', morganOptions);
	}

	// Output all of the 'debug' logging to custom stream

	// in the log file, we remove colors
	const Transform = require('stream').Transform;
	const removeColorsTransform = new Transform({
		transform (chunk, encoding, callback) {
			this.push(chunk.toString().replace(new RegExp('.*?m', 'g'), ''));
			callback();
		},
	});
	removeColorsTransform.pipe(defaultDebugStream);
	let debugLog = env === 'development' ? debug.log : undefined;
	debug.log = function () {
		// here 'this; is the debug instance
		// so we have access to this.namespace (for instance "app:http") - so morgan namespace could be skipped if desired
		removeColorsTransform.write(util.format.apply(util, arguments) + '\n');

		// if needed can output to the default log stream 'process.stderr'
		if (debugLog) {
			debugLog.apply(this, arguments);
		}
	};


};
