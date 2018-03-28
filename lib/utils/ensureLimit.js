const ellipsize = require('ellipsize');

/**
 * Truncates text. By default words are truncated (e.g. they are cut in the middle),
 * but passing {truncate:false) will change this. Default ellipsis is '...' and
 * default breaking chars are [' ', '-'].
 * If passed undefined/null/'' string a default string could be returned if options.default is specified,
 * otherwise the same string is returned
 * @param {String} str
 * @param {Number} limit
 * @param {{chars: String[], ellipse: String, truncate: Boolean, default: String}} [options]
 * @returns {String}
 */
function ensureLimit (str, limit, options) {
	if (!str) return options.default || str;

	return ellipsize(str, limit, options);
}

module.exports = ensureLimit;
