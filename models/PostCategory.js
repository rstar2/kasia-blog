const keystone = require('keystone');
const utils = keystone.utils;
const Types = keystone.Field.Types;

/**
 * PostCategory Model
 * ==================
 */

const PostCategory = new keystone.List('PostCategory');

PostCategory.add({
	name: { type: String, required: true },
	slug: { type: String },
	parent: { type: Types.Relationship, ref: 'PostCategory' },
});

PostCategory.schema.pre('save', function (next) {
	// if 'slug' is still not entered use the obligatory 'name' field
	// thus 'slug' is also obligatory
	const slug = this.slug || this.name;
	this.slug = utils.slug(slug);

	next();
});

PostCategory.relationship({ ref: 'Post', path: 'posts', refPath: 'categories' });

PostCategory.defaultColumns = 'name, slug';
PostCategory.register();
