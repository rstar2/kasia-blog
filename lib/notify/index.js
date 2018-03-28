const async = require('async');
const debug = require('debug')('app:notify');

const email = require('./email');
const sms = require('./sms');


const gateways = {
	email,
	sms,
};

function sendFor (subjectType, keystone, subject, methods = ['email'], callback = null) {
	if (typeof callback !== 'function') {
		callback = function (err) {
			if (err) {
				console.error('There was an error sending the notification email:', err);
			}
		};
	}

	const tasks = methods.map((method) => (callback) => {
		const gateway = gateways[method];
		if (!gateway) {
			return callback(`No notify-gateway defined for method '${method}'`);
		}

		gateway.sendFor(keystone, subjectType, subject, callback);
	});

	// use async for sending to different gateways and there to be only one final CALLBACK
	async.parallel(async.reflectAll(tasks),
		function (err, results) {
			// there will be no error globally - just in the results
			// results[0].value = 'xxxx'
			// results[1].error = Error('bad stuff happened')
			// results[2].value = 'xxxx'

			const hasSuccess = results.some(result => !result.error);
			if (hasSuccess) {
				if (debug.enabled) debug(`Successfully notified for ${subjectType}`);
				return callback(null);
			}

			// if all gateways have failed, e.g. only errors - then fail
			// error with the first resulted error even though they could be more
			const error = results[0].error;

			if (debug.enabled) debug(`Failed to notify for ${subjectType} because of ${error}`);
			callback(error);
		});
}

module.exports = {
	sendNotificationsForEnquiry: sendFor.bind(this, 'enquiry'),
	sendNotificationsForOrder: sendFor.bind(this, 'order'),
};
