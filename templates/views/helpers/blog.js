const _ = require('lodash');

const { createUrl, linkTemplate } = require('./util');

const helpers = {

	// Direct url link to a specific post
	blogUrl: function (part, options) {
		return createUrl('/blog', part);
	},

	// Direct url link to a specific post
	postUrl: function (postSlug, options) {
		return helpers.blogUrl('post/' + postSlug);
	},

	// might be a ghost helper
	// used for pagination urls on blog
	blogPageUrl: function (pageNumber, options) {
		return helpers.blogUrl() + '?page=' + pageNumber;
	},

	// TODO: Move to separate pagination.js file and make more general - to be used from shop/products page also
	// ### Pagination Helpers
	// These are helpers used in rendering a pagination system for content
	// Mostly generalized and with a small adjust to `_helper.blogPageUrl` could be universal for content types

	/*
	* expecting the data.posts context or an object literal that has `previous` and `next` properties
	* ifBlock helpers in hbs - http://stackoverflow.com/questions/8554517/handlerbars-js-using-an-helper-function-in-a-if-statement
	* */
	ifHasPagination: function (postContext, options) {
		// if implementor fails to scope properly or has an empty data set
		// better to display else block than throw an exception for undefined
		if (_.isUndefined(postContext)) {
			return options.inverse(this);
		}
		if (postContext.next || postContext.previous) {
			return options.fn(this);
		}
		return options.inverse(this);
	},

	paginationNavigation: function (pages, currentPage, totalPages, options) {
		let html = '';

		// pages should be an array ex.  [1,2,3,4,5,6,7,8,9,10, '....']
		// '...' will be added by keystone if the pages exceed 10
		_.each(pages, function (page, ctr) {
			// create ref to page, so that '...' is displayed as text even though int value is required
			const pageText = page;
			// create boolean flag state if currentPage
			const isActivePage = ((page === currentPage) ? true : false);
			// need an active class indicator
			const liClass = ((isActivePage) ? ' class="active"' : '');

			// if '...' is sent from keystone then we need to override the url
			if (page === '...') {
				// check position of '...' if 0 then return page 1, otherwise use totalPages
				page = ((ctr) ? totalPages : 1);
			}

			// get the pageUrl using the integer value
			const pageUrl = helpers.blogPageUrl(page);
			// wrapup the html
			html += '<li' + liClass + '>' + linkTemplate({ url: pageUrl, text: pageText }) + '</li>\n';
		});
		return html;
	},

	// special helper to ensure that we always have a valid page url set even if
	// the link is disabled, will default to page 1
	paginationPreviousUrl: function (previousPage, totalPages) {
		if (previousPage === false) {
			previousPage = 1;
		}
		return helpers.blogPageUrl(previousPage);
	},

	// special helper to ensure that we always have a valid next page url set
	// even if the link is disabled, will default to totalPages
	paginationNextUrl: function (nextPage, totalPages) {
		if (nextPage === false) {
			nextPage = totalPages;
		}
		return helpers.blogPageUrl(nextPage);
	},

};

module.exports = helpers;
