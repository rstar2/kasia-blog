module.exports = function (keystone) {
	// could allow only access from certain hosts if required
	keystone.set('cors allow origin', true);
};
