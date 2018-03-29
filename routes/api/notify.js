/**
 * Router for testing sending notifications - emails and SMS-es
 */

const keystone = require('keystone');

const { sendNotificationsForEnquiry } = require('../../lib/notify');

// API Test notifications - sending emails and SMS-es
const router = keystone.createRouter();
router.post('/enquiry/:gateway', forEnquiry);

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
