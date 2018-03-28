/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
const _ = require('lodash');

const debug = require('debug')('app:routes');

/**
	Initializes the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: req.__('Home'), key: 'home', href: '/' },
		{ label: req.__('Blog'), key: 'blog', href: '/blog' },
		{ label: req.__('Gallery'), key: 'gallery', href: '/gallery' },
		{ label: req.__('Contact'), key: 'contact', href: '/contact' },
		{ label: req.__('Shop'), key: 'shop', href: '/shop' },
		{
			label: req.__('Cart'), key: 'shopping-cart', href: '/shop/cart',
			icon: 'shopping-cart', isRight: true,
		},
	];
	// expose the user (if any) and the session to the views
	res.locals.user = req.user;
	res.locals.session = req.session;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	let flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (messages) {
		return messages.length;
	}) ? flashMessages : false;
	next();
};

/**
	Don't cache the content.
	Maybe it's useful for some kind of pages but for dynamic site generally it's not
*/
exports.cacheControl = function (req, res, next) {
	// Add 'no-store' - otherwise Chrome Back Button will still serve cached version
	res.setHeader('Cache-Control', 'no-cache, no-store');
	next();
};

/**
	Prevents people from accessing protected pages when they're not signed in.
	Also protects protected API endpoints.
 */
exports.requireAuth = function (keystone) {
	return function (req, res, next) {
		// api not allowed error
		if (!req.user && res.apiNotAllowed) {
			return res.apiNotAllowed();
		}

		if (!req.user || !req.user.canAccessKeystone) {
			if (req.headers.accept.indexOf('application/json') !== -1) {
				return req.user
					? res.status(403).json({ error: 'not authorized' })
					: res.status(401).json({ error: 'not signed in' });
			}
			const regex = new RegExp('^\/' + keystone.get('admin path') + '\/?$', 'i');
			const from = regex.test(req.originalUrl) ? '' : '?from=' + req.originalUrl;
			req.flash('error', 'Please sign in to access this page.');
			return res.redirect(keystone.get('signin url') + from);
		}
		next();
	};
};

/**
	Prevents people from accessing protected API when they're not signed in
 */
exports.validateCorsAPI = function (keystone) {
	return function (req, res, next) {
		// Check if this is API call is allowed
		// this has to be done before the real work middleware is hit
		// and after the core keystone,middleware.cors that sets the CORS headers
		// according to the settings


		const origin = keystone.get('cors allow origin');
		let isAllowed = (origin === true || origin === req.host);

		// TODO: could validate the method and headers also if needed
		// if (keystone.get('cors allow methods') !== false) {
		// 	res.header('Access-Control-Allow-Methods', keystone.get('cors allow methods') || 'GET,PUT,POST,DELETE,OPTIONS');
		// }
		// if (keystone.get('cors allow headers') !== false) {
		// 	res.header('Access-Control-Allow-Headers', keystone.get('cors allow headers') || 'Content-Type, Authorization');
		// }

		if (!isAllowed) {
			res.apiNotAllowed(null, 'CORS is not allowed');
		} else {
			next();
		}
	};
};

/**
    Inits the error handler functions into `res`
*/
exports.initErrorHandlers = function (req, res, next) {
	res.error = function (error, title, message) {
		debug(`Request ${req} failed with error: ${error}; title: ${title}; message: ${message}`);

		res.status(500);
		if (res.apiError) {
			return res.apiError(error);
		} else if (req.headers.accept.indexOf('application/json') !== -1) {
			return res.json({ error });
		} else {
			return res.render('errors/500', {
				error,
				errorTitle: title,
				errorMsg: message,

				// this is for express-handlebars to set that we don't want the default layout
				layout: false,
			});
		}
	};

	res.notFound = function (title, message) {
		res.status(404);
		if (res.apiNotFound) {
			return res.apiNotFound();
		} else if (req.headers.accept.indexOf('application/json') !== -1) {
			return res.json({ error: 'Not found' });
		} else {
			res.render('errors/404', {
				errorTitle: title,
				errorMsg: message,

				// this is for express-handlebars to set that we don't want the default layout
				layout: false,
			});
		}
	};

	next();
};
