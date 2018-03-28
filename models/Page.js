const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Page Model
 * ==========
 */

const Page = new keystone.List('Page', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true, fixed: true },
});

Page.add({
	title: { type: String, required: true },
	slug: { type: Types.Key }, // allow the slug to be explicitly specified
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	content: { type: Types.Html, wysiwyg: true, height: 350 },
	categories: { type: Types.Relationship, ref: 'PageCategory', many: true },
});

Page.schema.methods.isPublished = function () {
	return this.state === 'published';
};

Page.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Page.register();
