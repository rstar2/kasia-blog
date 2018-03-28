const paypal = require('paypal-rest-sdk');
// https://github.com/paypal/PayPal-node-SDK

// To check the REST API for full details on what/which props are allowed in the JSON
// see https://developer.paypal.com/docs/api/payments/#definition-details

// 'sandbox' or 'live'
let mode = process.env.PAYPAL_MODE || 'sandbox';
if (mode === 'production') mode = 'live';

const client_id = process.env.PAYPAL_APP_PUBLIC_ID;
const client_secret = process.env.PAYPAL_APP_SECRET;

paypal.configure({
	mode,
	client_id,
	client_secret,
});

/**
 * Create a payment
 *
 * @param {Object} transaction
 * @param {String} [note_to_payer]
 * @param {String} [experience_profile_id]
 * @param {Function} callback
 */
exports.create = function ({ transaction, note_to_payer, experience_profile_id }, callback) {
	const create_payment_json = {
		intent: 'sale',
		payer: {
			payment_method: 'paypal',
		},
		redirect_urls: {
			// not used in the application but are necessary
			return_url: 'http://return.url',
			cancel_url: 'http://cancel.url',
		},
		transactions: [transaction],

		//  The PayPal-generated ID for the merchant's payment experience profile.
		// For information, see https://developer.paypal.com/docs/api/payment-experience/#web-profiles_create
		// To create one it must be only from the REST API
		// example https://github.com/paypal/PayPal-node-SDK/blob/master/samples/payment_experience/web_profile/create_payment_with_customized_experience.js
		experience_profile_id,
		note_to_payer,
	};

	paypal.payment.create(create_payment_json, callback);
};

/**
 * Get a payment
 *
 * @param {String} paymentID
 * @param {Function} callback
 */
exports.get = function ({ paymentID }, callback) {
	paypal.payment.get(paymentID, callback);
};


/**
 * Execute a payment
 *
 * @param {String} paymentID
 * @param {String} payerID
 * @param {Function} callback
 */
exports.execute = function ({ paymentID, payerID }, callback) {
	const execute_payment_json = {
		payer_id: payerID,
	};

	paypal.payment.execute(paymentID, execute_payment_json, callback);
};
