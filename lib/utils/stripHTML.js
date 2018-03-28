const htmlToText = require('html-to-text');
/**
 * Strips HTML formatted string to plain text.
 * @param {String} html HTML formatted string
 * @param {Object} [options] formatting options. See 'html-to-text' for all properties.
 * @returns {String} plain text string
 */
function stripHTML (html, options) {
	if (!html) return html;

	return htmlToText.fromString(html, options);
}

module.exports = stripHTML;
