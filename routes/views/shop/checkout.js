const debug = require('debug')('app:routes:views:shop:checkout');
const _ = require('lodash');

const keystone = require('keystone');

const Cart = require('../../../lib/models/shop/Cart');
const ShippingZone = keystone.list('ShippingZone');
const Order = keystone.list('Order');

const listProviders = new Map();
listProviders.set('paypal', require('./checkout-paypal'));

exports = module.exports = function (req, res, next) {

	const view = new keystone.View(req, res);

	if (!req.session.cart) return next('Checkout failed - no cart');
	const cart = new Cart(req.session.cart);

	const providerKey = req.params.provider;
	const provider = listProviders.get(providerKey);
	if (!provider) return next(`Checkout failed - provider '${providerKey}' is not supported`);

	const action = req.params.action;

	let details;

	// the details are needed only on 'create' action
	if (action === 'create') {
		// get the shipping zone if any
		view.on('init', function (next) {
			const shippingZoneId = req.body.shippingZone;

			// selected shipping zone is obligatory
			if (!_.isUndefined(shippingZoneId)) {
				keystone.list('ShippingZone').model.findById(shippingZoneId)
					.exec(function (err, zone) {
						if (err) return next(err);

						// remember selected shippingZone in the session - serialize it (it will be auto serialized anyway)
						req.session.shippingZone = zone.toObject();

						details = {
							cart,
							shippingZone: zone,

							currency: 'EUR',
							// discount: 20,
							noteToPayer: 'Contact us for any questions on your order.',
							description: 'The payment transaction description.',
						};

						next();
					});
			} else {
				next('No shipping zone provided');
			}
		});
	} else {
		// recreate the ShippingZone  as it's survived session serialization
		if (!req.session.shippingZone) {
			next('No shipping zone survived');
		}
		details = {
			cart,

			// deserialize the ShippingZone object - e.g. re-create it
			shippingZone: new ShippingZone.model(req.session.shippingZone),
		};
	}

	view.render(function (error) {
		if (error) return next(error);

		provider(req, action, details, function (error, order, data = {}) {
			if (error) return next(error);

			// the Order model may not be created on each checkout-flow step,
			// this could depend on the provider
			if (order) {
				switch (order.status) {
					case Order.Status.CREATED:
						break;
					case Order.Status.PAID:
						// empty current session cart and shippingZone
						delete req.session.cart;
						delete req.session.shippingZone;
						break;
					default:
						debug(`Unsupported order status: ${order.status}`);
						throw new Error(`Unsupported order status: ${order.status}`);
				}
				// save it to DB - don't listen to the callback as the payment is successful anyway
				// just trace
				order.save(function (error) {
					if (error) debug(`Checkout - saving order '${order.id}' for '${order.email}' failed`);
					else debug(`Checkout - saving order '${order.id}' for '${order.email}' succeeded`);
				});
			}

			// repass the needed data to the client
			res.status(200).json(data);
		});
	});

};
