/**
 * Exposes an 'id' property in the JSON generated from the given Mongoose item.
 * Otherwise the JSON contains only a '_id' property which is not very used friendly to be used in a client
 *
 * @param {*} item Mongoose object
 */
exports.toJSON = function (item) {
	return { ...item.toJSON(), id: item.id };
};
