
const _ = require('lodash');

exports.scriptTemplate = _.template('<script src="<%= src %>"></script>');
exports.cssLinkTemplate = _.template('<link href="<%= href %>" rel="stylesheet">');
exports.linkTemplate = _.template('<a href="<%= url %>"><%= text %></a>');

exports.createUrl = function (base, slug) {
	return _.isString(slug) ? `${base}/${slug}` : `${base}`;
};
