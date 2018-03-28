const async = require('async');
const keystone = require('keystone');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'shop';

	// Load all categories
	view.on('init', function (next) {

		keystone.list('ProductCategory').model.find().sort('name')
			.exec(function (err, categories) {

				if (err || !categories.length) {
					return next(err);
				}

				locals.categories = categories;

				// Load the counts for each category
				async.each(locals.categories, function (category, next) {

					keystone.list('Product').model.count().where('categories').in([category.id])
						.exec(function (err, count) {
							category.count = count;
							next(err);
						});

				}, function (err) {
					next(err);
				});
			});
	});

	// Load the current category filter
	view.on('init', function (next) {

		if (req.params.category) {
			keystone.list('ProductCategory').model.findOne({ slug: req.params.category })
				.exec(function (err, category) {
					locals.category = category;
					next(err);
				});
		} else {
			next();
		}
	});

	// Load the products
	view.on('init', function (next) {

		const q = keystone.list('Product').paginate({
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('categories');

		if (locals.category) {
			q.where('categories').in([locals.category]);
		}

		q.exec(function (err, results) {
			locals.products = results;
			next(err);
		});
	});

	// Render the view
	view.render('shop/index');
};
