const keystone = require('keystone');

/**
 * PageCategory Model
 * ==================
 */

const PageCategory = new keystone.List('PageCategory', {
	autokey: { path: 'slug', from: 'name', unique: true },
});

PageCategory.add({
	name: { type: String, required: true },
});

PageCategory.relationship({ ref: 'Page', path: 'pages', refPath: 'categories' });

PageCategory.register();
