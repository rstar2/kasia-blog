const keystone = require('keystone');
const async = require('async');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Init locals
	locals.section = 'blog';

	// Load all categories
	view.on('init', function (next) {

		keystone.list('PostCategory').model.find().sort('name')
			.exec(function (err, categories) {

				if (err || !categories.length) {
					return next(err);
				}

				locals.categories = categories;

				// Load the counts for each category
				async.each(locals.categories, function (category, next) {

					keystone.list('Post').model.count().where('categories').in([category.id])
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
			keystone.list('PostCategory').model.findOne({ slug: req.params.category })
				.exec(function (err, category) {
					locals.category = category;
					next(err);
				});
		} else {
			next();
		}
	});

	// Load the posts
	view.on('init', function (next) {

		const q = keystone.list('Post').paginate({
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('author categories');

		if (locals.category) {
			q.where('categories').in([locals.category]);
		}

		q.exec(function (err, results) {
			locals.posts = results;
			next(err);
		});
	});

	// Render the view
	view.render('blog');
};
