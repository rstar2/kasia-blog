const keystone = require('keystone');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);

	const page = req.params.page;

	// Render the test view
	view.render(`test/${page}`, { layout: 'test' });
};
