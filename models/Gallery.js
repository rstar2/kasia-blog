const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Gallery Model
 * =============
 */

const Gallery = new keystone.List('Gallery', {
	autokey: { path: 'slug', from: 'name', unique: true },
});

Gallery.add({
	name: { type: String, required: true },
	publishedDate: { type: Date, default: Date.now },
	heroImage: { type: Types.Relationship, ref: 'FileUpload' },
	images: { type: Types.Relationship, ref: 'FileUpload', many: true, sortable: true },
});

Gallery.register();
