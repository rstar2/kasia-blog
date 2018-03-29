module.exports = function () {

	const helpers = {};

	// merger all helpers in one
	Object.assign(helpers,
		require('./common'),
		require('./flash'),
		require('./blog'),
		require('./blog_admin'),
		require('./cloudinary'),
		require('./page'),
	);

	return helpers;
};
