const { createUrl } = require('./util');

const helpers = {
	pageUrl: function (pageSlug, options) {
		return createUrl('/page', pageSlug);
	},
};

module.exports = helpers;
