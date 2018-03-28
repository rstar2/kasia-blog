/**
 * Router for testing sending notifications - emails and SMS-es
 */

const keystone = require('keystone');

const { sendNotificationsForEnquiry, sendNotificationsForOrder } = require('../../lib/notify');

// API Test notifications - sending emails and SMS-es
const router = keystone.createRouter();
router.post('/enquiry/:gateway', forEnquiry);
router.post('/order/:gateway', forOrder);

module.exports = router;


function forEnquiry (req, res) {
	// To test enquiry notifications we create a dummy enquiry that
	// is not saved to the database, but passed to the template.

	let gateways = req.body.isSMS === true ? ['sms'] : ['email'];


	const Enquiry = keystone.list('Enquiry');
	const newEnquiry = new Enquiry.model({
		name: req.body.name, // firstName and LastName
		email: req.body.email,
		phone: req.body.phone,
		enquiryType: 'message',
		message: { md: req.body.message },
	});

	sendNotificationsForEnquiry(keystone, newEnquiry, gateways, (error) => {
		if (error) {
			return res.apiError(error);
		}
		res.apiResponse({
			success: true,
		});
	});
}

function forOrder (req, res) {
	// To test enquiry notifications we create a dummy order that
	// is not saved to the database, but passed to the template.

	let gateways = req.body.isSMS === true ? ['sms'] : ['email'];

	const User = keystone.list('User');
	const user = new User.model({
		name: req.body.name, // firstName and LastName
		email: req.body.email,
		phone: req.body.phone,
	});

	const Order = keystone.list('Order');
	const newOrder = new Order.model({
		user: user,
		zone: req.body.zone,
		shippingAddress: req.body.shippingAddress,
		paymentId: 'paymentID',
		paymentProvider: 'PayPal',
		products: [{ id: 'productId_1', quantity: 1 }, { id: 'productId_3', quantity: 3 }],
		totalPrice: req.body.totalPrice,
	});

	sendNotificationsForOrder(keystone, newOrder, gateways, (error) => {
		if (error) {
			return res.apiError(error);
		}
		res.apiResponse({
			success: true,
		});
	});
}
