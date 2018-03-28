const _ = require('lodash');
const moment = require('moment');
const hbs = require('handlebars');

const { linkTemplate } = require('./util');
const blogUrl = require('./blog').blogUrl();

const helpers = {
	/**
	 * Generic HBS Helpers
	 * ===================
	 */

	// standard hbs equality check, pass in two values from template
	// {{#ifeq keyToCheck data.myKey}} [requires an else blockin template regardless]
	ifeq: function (a, b, options) {
		if (a == b) { // eslint-disable-line eqeqeq
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	},

	/**
	 * Usage:
	 * {{ifx (is env '==' 'production') '.min' ''}}
	 */
	is: function (a, operator, b) {
		let bool = false;
		switch (operator) {
			case '===':
				bool = a === b;
				break;
			case '!==':
				bool = a !== b;
				break;
			case '==':
				// eslint-disable-next-line 
				bool = a == b;
				break;
			case '!=':
				// eslint-disable-next-line 
				bool = a != b;
				break;
			case '>':
				bool = a > b;
				break;
			case '>=':
				bool = a >= b;
				break;
			case '<':
				bool = a < b;
				break;
			case '<=':
				bool = a <= b;
				break;
			default:
				throw new Error('Unknown operator ' + operator);
		}
		return bool;
	},

	/**
	 * Usage:
	 * {{#iff name '==' 'Foo'}}
     *    true
     * {{else}}
     *    false
     * {{/iff}}
	 *
	 * {{else}} block is optional
	 */
	iff: function (a, operator, b, options) {
		const bool = helpers.is(a, operator, b);

		if (bool) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	},

	/**
	* Usage:
	* {{ifx name 'True' 'False'}}
	*/
	ifx: function (condition, ifVal, elseVal) {
		return condition ? ifVal : elseVal;
	},

	/**
	 * Checks if an object's ID is the same as the passed.
	 * The passed object must have 'id' property.
	 *
	 * Usage:
	 *
	 * {{isSame user '123456789'}}
	 * {{ifx (isSame category '123456789') 'active' ''}}
	 *
	 * {{#if (isSame user '12345') }}
     *    True
     * {{else}}
     *    False
     * {{/if}}
	 */
	isSame: function (obj, id) {
		return !!(obj && (obj === id || obj.id === id));
	},

	// ### Date Helper
	// A port of the Ghost Date formatter similar to the keystonejs - pug interface
	//
	//
	// *Usage example:*
	// `{{date format='MM YYYY}}`
	// `{{date publishedDate format='MM YYYY'`
	//
	// Returns a string formatted date
	// By default if no date passed into helper than then a current-timestamp is used
	//
	// Options is the formatting and context check this.publishedDate
	// If it exists then it is formated, otherwise current timestamp returned
	date: function (context, options) {
		if (!options && context.hasOwnProperty('hash')) {
			options = context;
			context = undefined;

			if (this.publishedDate) {
				context = this.publishedDate;
			}
		}

		// ensure that context is undefined, not null, as that can cause errors
		context = context === null ? undefined : context;

		const f = options.hash.format || 'MMM Do, YYYY';
		const timeago = options.hash.timeago;
		// if context is undefined and given to moment then current timestamp is given
		// nice if you just want the current year to define in a template
		const date = timeago ? moment(context).fromNow() : moment(context).format(f);
		return date;
	},

	//  ### underscoreMethod call + format helper
	//	Calls to the passed in underscore method of the object (Keystone Model)
	//	and returns the result of format()
	//
	//  @obj: The Keystone Model on which to call the underscore method
	//	@undescoremethod: string - name of underscore method to call
	//
	//  *Usage example:*
	//  `{{underscoreFormat enquiry 'enquiryType'}}
	underscoreFormat: function (obj, underscoreMethod) {
		return obj._[underscoreMethod].format();
	},

	// ### Category Helper
	// Ghost uses Tags and Keystone uses Categories
	// Supports same interface, just different name/semantics
	//
	// *Usage example:*
	// `{{categoryList categories separator=' - ' prefix='Filed under '}}`
	//
	// Returns an html-string of the categories on the post.
	// By default, categories are separated by commas.
	// input. categories:['tech', 'js']
	// output. 'Filed Under <a href="blog/tech">tech</a>, <a href="blog/js">js</a>'

	categoryList: function (categories, options) {
		const autolink = _.isString(options.hash.autolink) && options.hash.autolink === 'false' ? false : true;
		const separator = _.isString(options.hash.separator) ? options.hash.separator : ', ';
		const prefix = _.isString(options.hash.prefix) ? options.hash.prefix : '';
		const suffix = _.isString(options.hash.suffix) ? options.hash.suffix : '';
		const parentRoute = _.isString(options.hash.parentRoute) ? options.hash.parentRoute : blogUrl;
		let output = '';

		function createTagList (tags) {
			const tagNames = _.map(tags, 'name');

			if (autolink) {
				return _.map(tags, function (tag) {
					return linkTemplate({
						url: (`${parentRoute}/` + tag.slug),
						text: _.escape(tag.name),
					});
				}).join(separator);
			}
			return _.escape(tagNames.join(separator));
		}

		if (categories && categories.length) {
			output = prefix + createTagList(categories) + suffix;
		}
		return new hbs.SafeString(output);
	},

	// create the category url for a blog-category page
	categoryUrl: function (categorySlug, options) {
		const parentRoute = _.isString(options.hash.parentRoute) ? options.hash.parentRoute : blogUrl;

		return (`${parentRoute}/` + categorySlug);
	},

	/**
	 * Return whether there's an authenticated user.
	 */
	isAuth: function (user, options) {
		return !!user;
	},

};

module.exports = helpers;
