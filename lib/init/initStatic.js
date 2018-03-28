const quickthumb = require('quickthumb');

const initLessRouter = require('./initLess').initRouter;
const initLocalizationRouter = require('./initLocalization').initRouter;

module.exports = function (keystone) {

	// Custom Less and Static middleware as
	// I'll add 'quickthumb' support and
	// also there will be uploads folder publicly accessible

	// Note - only one 'pre:static' hook can be existing
	keystone.set('pre:static', function (app) {
		const staticRoot = 'public';
		const uploadRoot = 'uploads';

		// Note the Less middleware must be always before the static one
		initLessRouter(staticRoot, keystone, app);

		// allow static access to the "normal" static files (js/css/images)
		// as well as to the upload folder
		[staticRoot, uploadRoot].forEach(root => {
			const rootExpanded = keystone.expandPath(root);
			// Note the Quickthumb middleware must be always before the static one
			// Usage: <img src="/public/images/image.gif?dim=80x40" />
			app.use('/' + root, quickthumb.static(rootExpanded));

			app.use('/' + root, keystone.express.static(rootExpanded));
		});


		// finally attach the localization routes
		initLocalizationRouter(keystone, app);
	});

};
