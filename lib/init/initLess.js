const path = require('path');
const less = require('less-middleware');

// configure the Less.js middleware
// see https://github.com/emberfeather/less.js-middleware
exports = module.exports = function (keystone) {
	const env = keystone.get('env');

	switch (env) {
		case 'development':
			// generate source maps for the Less compiled files
			keystone.set('less options', {
				// debug: true,
				render: {
					sourceMap: {
						sourceMapFileInline: true,
						// sourceMapRootpath: 'root/less/',
						sourceMapBasepath: path.resolve(keystone.expandPath('public'), 'styles'),
					},
				},
			});
			break;
	}
};


// attach some Localization changing routes
exports.initRouter = function (staticRoot, keystone, app) {
	app.use('/' + staticRoot,
		less(keystone.expandPath(staticRoot), keystone.get('less options') || {}));
};
