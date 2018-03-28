const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
const User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
},
	'Permissions', {
		isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	}, {
		phone: { type: String },
	});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.schema.methods.markActive = function () {
	this.lastActiveOn = new Date();
	return this;
};


/**
 * Relationships. They are used only in the Admin UI for displaying a reference relation.
 * Relationship definitions are optional; if you leave them out,
 * the relationships simply won't be displayed in the Admin UI from
 * the other side of the relationship. The relationship field will still work as expected.
 */
User.relationship({ path: 'posts', ref: 'Post', refPath: 'author' });

User.relationship({ path: 'comments', ref: 'PostComment', refPath: 'author' });


/**
 * These will be the columns shown in Keystone's Admin UI when listing users.
 * If not set - only the user's name will be visible
 */
User.defaultColumns = 'name, email, isAdmin';

/**
 * Registration
 */
User.register();
