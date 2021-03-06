const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

const Post = new keystone.List('Post', {
	// name - the field that contains the name of the item, for display in the Admin UI.
	// so when mapped to 'title' the 'title' will be showed as name displayed in the Admin UI.
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
});

Post.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	// image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 },
	},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
});

Post.schema.virtual('content.full').get(function () {
	return this.content.extended || this.content.brief;
});

Post.schema.methods.isPublished = function () {
	return this.state === 'published';
};

Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();
