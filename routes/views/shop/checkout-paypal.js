const debug = require('debug')('app:routes:views:shop:checkout:paypal');
const _ = require('lodash');
const async = require('async');

const keystone = require('keystone');

const stripHTML = require('../../../lib/utils/stripHTML');
const ensureLimit = require('../../../lib/utils/ensureLimit');
const paypal = require('../../../lib/payments/paypal');

const Order = keystone.list('Order');

/**
 * PayPal provider/gateway payment route
 * @param {Request} req HTTP incoming request
 * @param {String} action payment action - can be either 'create' or 'execute'
 * @param {Function} callback could be called synchronously or asynchronously
 */
module.exports = function (req, action, opt = {}, callback) {
	switch (action) {
		case 'create':
			create(req, opt, callback);
			break;
		case 'execute':
			execute(req, opt, callback);
			break;
		default:
			callback('Paypal-checkout - invalid action');
	}
};

/**
 * @param {Request} req
 * @param {Object} opt
 * @param {Function} callback
 */
function create (req, opt, callback) {
	// To check the REST API for full details on what/which props are allowed in the JSON
	// see https://developer.paypal.com/docs/api/payments/#definition-details

	// NOTE - total amount must sum up to all details
	// + subtotal = 10 * 2 + 20 * 3
	// + shipping = 15
	// + tax = 3
	// + handling_fee = 1
	// + insurance = 1
	// + gift_wrap = 0
	// - shipping_discount = 0
	// - discount = 2
	// --------------
	//  98 EUR
	// const transaction = {
	// 	amount: {
	// 		total: '38.00',
	// 		currency: 'EUR',
	// 		details: {
	// 			subtotal: '20.00',
	// 			shipping: '15.00',
	// 			tax: '3.00',
	// 			handling_fee: '1.00',
	// 			insurance: '1.00',
	// 			discount: '2.00',
	// 			// shipping_discount: '0'
	// 			// gift_wrap: '0'
	// 		},
	// 	},
	// 	item_list: {
	// 		items: [
	// 			{
	// 				sku: 'id1', // stock keeping number
	// 				name: 'item 1',
	// 				price: '10',
	// 				quantity: '2',
	// 				description: 'item 1 description',
	// 				currency: 'EUR',
	// 			},
	// 			/* {
	// 				sku: 'id2',
	// 				name: 'item 2',
	// 				price: '20',
	// 				quantity: '3',
	// 				description: 'item 2 description',
	// 				currency: 'EUR',
	// 			} */
	// 		],
	// 	},
	// 	description: 'The payment transaction description.',

	// 	// Maximum length: 165
	// 	// note_to_payee: 'The note to the recipient of the funds in this transaction.',

	// 	//Maximum length: 127
	// 	// custom: 'merchant custom data',

	// 	// shipping_address: {
	// 	// 	recipient_name: 'Betsy Buyer',
	// 	// 	line1: '111 First Street',
	// 	// 	city: 'Saratoga',
	// 	// 	country_code: 'US',
	// 	// 	postal_code: '95070',
	// 	// 	state: 'CA',
	// 	// },
	// };

	// opt.cart and opt.shippingZone are ensured to be valid
	const cart = opt.cart.toJSON();  // convert from Cart type to plain JSON
	const shippingZone = opt.shippingZone;

	const currency = opt.currency || 'EUR';
	const total = toValidNum(cart.totalPrice)
		+ toValidNum(shippingZone.shipping)
		+ toValidNum(shippingZone.tax)
		- toValidNum(opt.discount);

	// TODO: limiting the string with ensureLimit() should be in the lib/paypal.js file
	const transaction = {
		amount: {
			total: toStringNum(total),
			details: {
				subtotal: toStringNum(cart.totalPrice),
				shipping: toStringNum(shippingZone.shipping),
				tax: toStringNum(shippingZone.tax),
				discount: toStringNum(opt.discount),
			},
			currency,
		},
		item_list: {
			items: Object.keys(cart.items).map(id => {
				const item = cart.items[id];
				return {
					sku: ensureLimit(id, 127),
					name: ensureLimit(item.product.title, 127),
					description: ensureLimit(stripHTML(item.product.description.brief.html), 127),
					price: toStringNum(item.product.price),
					quantity: toStringNum(item.qty),
					currency,
				};
			}),
		},
		description: ensureLimit(opt.description, 127),
	};

	// A free-form field that clients can use to send a note to the payer.
	// Maximum length: 165
	const note_to_payer = ensureLimit(opt.noteToPayer, 165);

	// The PayPal-generated ID for the merchant's payment experience profile
	// experience_profile_id:
	// TODO: test 'experience_profile_id'
	const experience_profile_id = undefined;

	paypal.create({ transaction, note_to_payer, experience_profile_id }, function (error, payment) {
		if (error) debug('Paypal-checkout - create payment failed');
		else debug('Paypal-checkout create - payment succeeded');

		// NOTE - Here we still don't have a shipping address
		const response = payment ? { paymentID: payment.id } : null;
		callback(error, null, response);
	});
}

/**
 * @param {Request} req
 * @param {Object} opt
 * @param {Function} callback
 */
function execute (req, opt, callback) {
	const paymentID = req.body.paymentID;
	const payerID = req.body.payerID;

	const cart = opt.cart.toJSON();  // convert from Cart type to plain JSON
	const shippingZone = opt.shippingZone;

	async.series({
		verify: function (next) {
			paypal.get({ paymentID }, function (error, payment) {
				if (error) debug('Paypal-checkout - execute payment failed');
				else debug('Paypal-checkout - execute payment succeeded');

				if (!error) {
					// validate the payer's shipping address with the selected shipping zone
					// this should be done in advance before executing the payment
					const shipping_address = payment.payer.payer_info.shipping_address;
					if (!shipping_address || !shipping_address.country_code) {
						error = 'No shipping country code provided';
					} else {
						const country = shipping_address.country_code;
						if (shippingZone.countries.indexOf(country) < 0) {
							error = 'Shipping country code is not verified by the selected zone';
						}
					}
				}
				return next(error);
			});
		},
		execute: function (next) {
			paypal.execute({ paymentID, payerID }, function (error, payment) {
				if (error) debug('Paypal-checkout - execute payment failed');
				else debug('Paypal-checkout - execute payment succeeded');

				// NOTE - Here we do have a shipping address
				// (either on the payer level or on a transaction level if we created the transaction with shipping address)

				// payment == {
				//     	...
				//     	payer: {
				//     		payment_method: 'paypal',
				//     		payer_info: {
				//     			email: 'bbuyer@example.com',
				//     			first_name: 'Betsy',
				//     			last_name: 'Buyer',
				//     			payer_id: 'CR87QHB7JTRSC',
				//              shipping_address: {
				//     				recipient_name: "Brian Robinson",
				//     				line1: "4th Floor",
				//     				line2: "Unit #34",
				//     				city: "San Jose",
				//     				state: "CA",
				//     				phone: "011862212345678",
				//     				postal_code: "95131",
				//     				country_code: "US"
				//     			}
				//     		},
				//     },
				//     transactions: [...]
				// };

				if (error) return next(error);

				// create the order

				const transaction = payment.transactions[0];
				const payerInfo = payment.payer.payer_info;

				const order = new Order.model({
					name: {
						first: payerInfo.first_name,
						last: payerInfo.last_name,
					},
					email: payerInfo.email,

					status: Order.Status.PAID,
					total: transaction.amount.total,

					shippingZone: shippingZone.id,

					shippingAddress: Object.keys(payerInfo.shipping_address)
						.map(key => key + ' : ' + payerInfo.shipping_address[key])
						.join('\n'),

					products: Object.keys(cart.items)
						.map(id => ({ id, quantity: cart.items[id].qty, price: cart.items[id].product.price })),

					paymentId: payment.id,
					paymentProvider: 'paypal',

					// also save the whole 'payment' object as coming from PayPal - just for reference
					payment,
				});

				next(null, order);
			});
		},
	}, function (error, results) {
		// results is now equal to: {verify: ..., execute: ...}
		callback(error, results ? results.execute : null);
	});
}

/**
 *
 * @param {Number} [num]
 * @param {Number} [maxLength]
 * @returns {String|undefined}
 */
function toStringNum (num, maxLength = 10) {
	if (_.isUndefined(num) || _.isNull(num)) return undefined;

	if (_.isNumber(num)) {
		const str = '' + num;

		// no more than 10 chars validations
		if (str.length > maxLength) {
			debug(`Convert to string : ${num} is more than ${maxLength} characters`);
			throw new Error(`PaypalCheckout - Convert to string : ${num} is more than ${maxLength} characters`);
		}
		return str;
	}

	debug(`Invalid type to convert to string : ${num}`);
	throw new Error(`PaypalCheckout - Invalid type to convert to string : ${num}`);
}

/**
 *
 * @param {Number} [num]
 * @returns {Number}
 */
function toValidNum (num) {
	if (_.isUndefined(num) || _.isNull(num)) return 0;
	if (_.isNumber(num)) return num;

	debug(`Invalid type to convert to valid number : ${num}`);
	throw new Error(`PaypalCheckout - Invalid type to convert to valid number : ${num}`);
}
