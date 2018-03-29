/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

const keystone = require('keystone');
const middleware = require('./middleware');

// import/require all the files in the 'lib/init' directory and call them
// Note, each one of them must export a function with argument 'keystone'
const middlewareFns = keystone.import('lib/middleware');
Object.keys(middlewareFns).forEach(key => middlewareFns[key](keystone));

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', middleware.cacheControl);

// Handle 404 errors
keystone.set('404', function (req, res, next) {
	// this is defined in middleware.initErrorHandlers
	res.notFound();
});

// Handle other errors
keystone.set('500', function (err, req, res, next) {
	let title, message;
	if (err instanceof Error) {
		message = err.message;
		err = err.stack;
	}
	// this is defined in middleware.initErrorHandlers
	res.error(err, title, message);
});

// Import Route Controllers
const importRoutes = keystone.importer(__dirname);
const routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api'),
};


// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);
	app.all('/contact', routes.views.contact);
	app.get('/about', routes.views.about);
	app.get('/blog/:category?', routes.views.blog);
	app.all('/blog/post/:post', routes.views.post);
	app.get('/page/:page?', routes.views.page);

	app.get('/gallery/:gallery?', routes.views.gallery);

	// Custom Admin related pages (for uploading files and etc...) - full SPA
	app.get('/admin(/**)?', routes.views.admin);

	// Attach to all API routes res.apiResponse() ...  methods
	app.all('/api/**', keystone.middleware.api);

	// authentication API (signin/signout)
	app.use('/api/auth', routes.api.auth);

	const apiProtected = [
		// allow registered users to API - return error if not
		middleware.requireAuth(keystone),

		// restrict CORS API (e.g. validate the request) - return json error if CORS is set and not met
		middleware.validateCorsAPI(keystone),

		// return proper CORS headers so that the client should accept the response
		keystone.middleware.cors,
	];

	// All API routes are protected and/or should allow CORS
	app.all('/api/**', ...apiProtected);

	app.use('/api/fileupload', routes.api.fileupload);
	app.use('/api/gallery', routes.api.gallery);
	app.use('/api/notify', routes.api.notify);
};
