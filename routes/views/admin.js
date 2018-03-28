exports = module.exports = function (req, res) {

	// Render the view (it's a real SPA app)
	// no need for keystone.View() and etc...
	res.render('admin', { layout: null });
};
