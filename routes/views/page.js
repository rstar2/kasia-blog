const keystone = require('keystone');

exports = module.exports = function (req, res, next) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	const slug = req.params.page;

	// Set locals
	// locals.section = 'page';

	// Load the current page
	view.on('init', function (next) {
		keystone.list('Page').model.findOne({
			state: 'published',
			slug,
		})
			.populate('author categories')
			.exec(function (err, page) {
				locals.page = page;
				next(err);
			});
	});

	// Render the view
	view.render(function () {
		// if page is not found there are 2 options:
		// 1. page not found could be rendered in the page.hbs template depending on the 'locals.page'
		// 2. rely on the Keystone/Express default 404 handler

		// take the second approach
		if (locals.page) {

			// try to render a page with template "page-slug" if not exists then use the default "page" one
			// couldn't find a more elegant way to check if a template exists - so check for error
			res.render(`page-${slug}`, function (err, html) {
				if (err) {
					if (err.message.indexOf('Failed to lookup view') !== -1) {
						return res.render('page');
					}
					throw err;
				}
				res.send(html);
			});
		} else {
			// rely on the default 404 handler
			next();
		}
	});
};
