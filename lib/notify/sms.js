const debug = require('debug')('app:notify:sms');

if (!process.env.TWILIO_ACCOUNT_SID
	|| !process.env.TWILIO_AUTH_TOKEN
	|| !process.env.NOTIFY_SMS_SENDER) {
	debug('Unable to send SMS - no Twilio credentials provided');
	module.exports = null;
	return;
}

const path = require('path');
const async = require('async');
const htmlToText = require('html-to-text');
const twilio = require('twilio');


// Your Account-SID and Auth-Token from www.twilio.com/console
// Your from www.twilio.com/console
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendFor = function (keystone, subjectType, subject, callback) {
	// get the admins' phones
	keystone.list('User').model.find()
		.where('isAdmin', true)
		.where('phone').exists()
		.select('phone')
		.exec()
		.then(admins => admins.map(admin => admin.phone))
		.then(adminPhones => {
			const brand = keystone.get('brand');
			const locals = { [subjectType]: subject, brand };

			if (!adminPhones.length) return callback('No admin phones to send SMS');

			// iterate through all phones
			const tasks = adminPhones.map((to) => (callback) => {
				send(keystone, {
					to, templateName: subjectType, locals,
				}, callback);
			});

			// send to each single admin phone
			async.parallel(async.reflectAll(tasks),
				function (err, results) {
					// check whether at least one SMS is sent
					const hasSuccess = results.some(result => !result.error);
					if (hasSuccess) return callback(null);

					// so all are errors - error with the first resulted error even though they could be more
					callback(results[0].error);
				});
		}).catch(err => {
			callback(err);
		});
};

function send (keystone, { to, templateName, locals = {} }, callback) {
	const templateRoot = keystone.get('sms');
	const templateExt = keystone.get('view engine');   // '.hbs' - String
	const templateEngine = keystone.get('custom engine');   // hbs.engine - Function

	const template = resolve(templateRoot, templateName, templateExt);
	templateEngine(template, { ...locals, layout: false }, function (err, html) {
		if (err) return callback(err);

		// just in case strip the HTML
		const body = htmlToText.fromString(html);

		try {
			client.messages.create({
				from: process.env.NOTIFY_SMS_SENDER, // From a valid Twilio number
				to,   								 // Text this number
				body,
			})
				.then(message => {
					debug(`Successfully sent SMS to ${to}`);
					callback(null);
				})
				.catch(err => {
					callback(err);
				});
		} catch (err) {
			callback(err);
		}
	});
}

/**
 * Resolves the path for a template, and ensures it points to a file
 * @param {String} root
 * @param {String} name
 * @param {String} [ext]
 * @returns {String}
 */
function resolve (root, name, ext = '') {
	// resolve the name with the root option
	const loc = path.resolve(root, name);
	// pull the directory part out of the resolved path
	const dir = path.dirname(loc);
	// put the filename part out of the resolved path, without the extension
	// since the extension may or may not be provided in name, we explicitly
	// put it back in the next step
	const file = path.basename(loc, ext);
	// join the directory, filename and extension to get the full path
	const filepath = path.join(dir, file + ext);
	// if the file exists, return the resolved path, otherwise undefined
	return filepath;
};


