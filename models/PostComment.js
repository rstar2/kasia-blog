const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
* property Model
* ==========
*/
const PostComment = new keystone.List('PostComment', {
	label: 'Comments',
	nocreate: true,
});

PostComment.add({
	author: { type: Types.Relationship, initial: true, ref: 'User', index: true },
	post: { type: Types.Relationship, initial: true, ref: 'Post', index: true },
	state: { type: Types.Select, options: ['published', 'archived'], default: 'published', index: true },
	publishedOn: { type: Types.Date, default: Date.now, noedit: true, index: true },
});

PostComment.add('Content', {
	content: { type: Types.Html, wysiwyg: true, height: 300 },
});

PostComment.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	if (!this.isModified('publishedOn') && this.isModified('state') && this.state === 'published') {
		this.publishedOn = new Date();
	}
	next();
});

PostComment.schema.post('save', function () {
	if (!this.wasNew) return;
	if (this.author) {
		keystone.list('User').model.findById(this.author).exec(function (err, user) {
			// mark when was the last time this user has commented
			if (user) {
				user.markActive().save();
			}
		});
	}
});

PostComment.track = true;
PostComment.defaultColumns = 'author, post, publishedOn, state';
PostComment.register();
