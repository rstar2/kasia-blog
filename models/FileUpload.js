const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * File Upload Model
 * ===========
 * A database model for uploading files to the local file system
 */

const FileUpload = new keystone.List('FileUpload', {
	track: true,
});

const localStorage = new keystone.Storage({
	adapter: keystone.Storage.Adapters.FS,
	fs: {
		path: 'uploads/files', // required; path where the files should be stored
		publicPath: '/uploads/files/', // path where files will be served from
		// the final 'url' property of the file will be generated from this and the filename
	},
	// generateFilename: function (file, i, callback) {
	// 	callback(null, file.extension);
	// },

	// By default only the 'filename', 'mimetype' and 'size' as added to the model schema
	// to explicitly enable the others we have to specify them:
	// e.g. by default: schema == {
	// 	filename: String,
	// 	size: true,
	// 	mimetype: true,
	// 	path: false,
	// 	originalname: false,
	// 	url: false,
	//  }
	schema: {
		path: true,
		originalname: true,
		url: true,
	},
});

FileUpload.add({
	name: { type: Types.Key, index: true },
	file: { type: Types.File, storage: localStorage },
	category: { type: String },
});

FileUpload.schema.pre('save', function (next) {
	// if no category is set - like empty string - then delete the whole field in the DB
	if (!this.category) {
		// setting it to 'undefined' will delete it from the document
		// Note - setting it 'null' will save it as NULL
		this.category = undefined;
	}

	next();
});

FileUpload.defaultColumns = 'name';
FileUpload.register();
