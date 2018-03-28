const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Product Model
 * ==========
 */

const Product = new keystone.List('Product', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
});

Product.add({
	title: { type: String, required: true },
	price: { type: Number, required: true, initial: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' }, default: Date.now },
	image: { type: Types.CloudinaryImage },
	images: { type: Types.CloudinaryImages },
	description: {
		brief: { type: Types.Markdown, wysiwyg: true, height: 150 },
		extended: { type: Types.Markdown, wysiwyg: true, height: 400 },
	},
	categories: { type: Types.Relationship, ref: 'ProductCategory', many: true },
	quantity: { type: Number },
	canBeBought: { type: Boolean, default: true },
});

Product.schema.virtual('description.full').get(function () {
	return this.description.extended ? this.description.extended : this.description.brief;
});

Product.schema.methods.isPublished = function () {
	return this.state === 'published';
};

// Product.schema.pre('save', function (next) {
// 	if (this.isModified('state') && this.isPublished() && !this.publishedAt) {
// 		this.publishedAt = new Date();
// 	}
// 	next();
// });

Product.defaultSort = '-publishedDate';
Product.defaultColumns = 'name, state, publishedDate, canBeBought';
Product.register();
