const keystone = require('keystone');

/**
* Specific helpers for blog-editors - e.g. when the user is able to
* edit a post straight from the main site
* ===========================
*/
module.exports = {

	isAdminEditor: function (user, options) {
		return (typeof (user) !== 'undefined' && user.isAdmin);
	},

	adminEditablePostUrl: function (user, id) {
		const rtn = keystone.content.editable(user, {
			list: 'Post',
			id: id,
		});
		return rtn;
	},

};
