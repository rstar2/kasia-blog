const keystone = require('keystone');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.section = 'xgallery';

	// Load the galleries by sortOrder
	view.query('galleries', keystone.list('GalleryCloud').model.find().sort('sortOrder'));

	// Render the view
	view.render('gallery_cloud');

};
