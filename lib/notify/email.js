const debug = require('debug')('app:notify:email');

if (!process.env.MAILGUN_API_KEY
	|| !process.env.MAILGUN_DOMAIN
	|| !process.env.NOTIFY_EMAIL_SENDER) {
	debug('Unable to send email - no Mailgun credentials provided');
	module.exports = null;
	return;
}

exports.sendFor = function (keystone, subjectType, subject, callback) {
	keystone.list('User').model.find().where('isAdmin', true).exec(function (err, admins) {
		if (err) return callback(err);

		// no matter 'admins' is array - the keystone.Email will handle thats
		send(keystone, {
			to: admins, templateName: subjectType, locals: { [subjectType]: subject },
		}, callback);
	});
};

function send(keystone, { to, templateName, locals = {} }, callback) {
	const brand = keystone.get('brand');

	new keystone.Email({
		templateName,
		transport: 'mailgun',
	}).send({
		to,
		subject: `New ${templateName} for ${brand}`,
		from: { // this is the MAILGUN (or other transport) sending user
			name: brand,
			email: process.env.NOTIFY_EMAIL_SENDER,
		},

		// these are locals for the template
		...locals,
		brand,

		// this is whether the template should use a layout
		layout: false,
	}, callback);
}
