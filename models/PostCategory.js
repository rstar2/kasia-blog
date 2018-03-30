const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * PostCategory Model
 * ==================
 */

const PostCategory = new keystone.List('PostCategory', {
	autokey: { path: 'slug', from: 'name', unique: true, fixed: true },
});

PostCategory.add({
	name: { type: String, required: true },
	slug: { type: Types.Key }, // allow the slug to be explicitly specified
	parent: { type: Types.Relationship, ref: 'PostCategory' },
});

PostCategory.relationship({ ref: 'Post', path: 'posts', refPath: 'categories' });

PostCategory.defaultColumns = 'name, slug';
PostCategory.register();
