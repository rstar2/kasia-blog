const keystone = require('keystone');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.section = 'blog';
	locals.validationErrors = {};

	// Load the current post
	view.on('init', function (next) {

		keystone.list('Post').model.findOne({
			state: 'published',
			slug: req.params.post,
		})
			.populate('author categories')
			.exec(function (err, post) {
				locals.post = post;
				next(err);
			});

	});

	// Load other posts
	view.on('init', function (next) {

		keystone.list('Post').model.find()
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author')
			.limit('4')
			.exec(function (err, posts) {
				locals.posts = posts;
				next(err);
			});

	});

	// Comments

	// Load comments on the Post
	view.on('init', function (next) {

		keystone.list('PostComment').model.find()
			// .where('post', locals.post._id)

			// Mongoose assigns each of your schemas an id virtual getter by default
			// which returns the documents _id field cast to a string, or in the case of ObjectIds, its hexString.
			// .where('post', locals.post.id)

			// .where('post', locals.post) // it will use the _id (as ObjectID type)
			// are all the same

			.where('post', locals.post)
			.where('state', 'published')
			.where('author').ne(null)
			.populate('author', 'name')
			.sort('-publishedOn')
			.exec(function (err, comments) {
				if (err) return res.err(err);
				if (!comments) return res.notfound('Post comments not found');
				locals.comments = comments;
				next();
			});

	});

	// Create a Comment
	view.on('post', { action: 'comment.create' }, function (next) {

		if (!req.user) {
			req.flash('error', 'You must be signed in to create a comment.');
			return next();
		}

		const newComment = new (keystone.list('PostComment').model)({
			post: locals.post.id,
			author: locals.user.id,
		});

		const updater = newComment.getUpdateHandler(req);

		// this internally will call newComment.updateItem() which in turn will
		// pass the data through the Keystone validators and finally call Mongoose save()
		updater.process(req.body, {
			fields: 'content', // update only the 'content' field
			flashErrors: true, // if error - create and add a flash message
			logErrors: true,   // if error - log it
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				req.flash('success', 'Your comment was added.');
				return res.redirect('/blog/post/' + locals.post.slug + '#comment-id-' + newComment.id);
			}
			next();
		});

	});

	// Delete a Comment
	view.on('get', { action: 'comment.remove' }, function (next) {

		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a comment.');
			return next();
		}

		keystone.list('PostComment').model.findOne({
			_id: req.query.comment,
			post: locals.post.id,
		})
			.populate('author', 'id')
			.exec(function (err, comment) {
				if (err) {
					if (err.name === 'CastError') {
						req.flash('error', 'The comment ' + req.query.comment + ' could not be found.');
						return next();
					}
					return res.err(err);
				}
				if (!comment) {
					req.flash('error', 'The comment ' + req.query.comment + ' could not be found.');
					return next();
				}
				if (comment.author.id !== req.user.id) {
					req.flash('error', 'Sorry, you must be the author of a comment to delete it.');
					return next();
				}

				// removed comments are actually "archived"
				comment.state = 'archived';
				comment.save(function (err) {
					if (err) return res.err(err);

					req.flash('success', 'Your comment has been deleted.');
					return res.redirect('/blog/post/' + locals.post.slug);
				});
			});

	});


	// Render the view
	view.render('post');
};
