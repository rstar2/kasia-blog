/**
 * Cleans HTML formatted string to ensure all extended characters are replaced.
 * @param {String} html HTML formatted string
 * @returns {String} cleaned HTML formatted string
 */
function cleanHTML (html) {
	if (!html) return html;

	html = html.replace(/[\u007f-\uffff]/g, function (c) {
		return '&#x' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4) + ';';
	});
	return html;
}

module.exports = cleanHTML;
