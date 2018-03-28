class Cart {

	constructor (oldCart = {}) {
		this._items = oldCart.items || {};
		this._totalQty = oldCart.totalQty || 0;
		this._totalPrice = oldCart.totalPrice || 0;
	}

	isEmpty () {
		return this._totalQty === 0;
	}

	add (product, qty = 1) {
		if (qty <= 0) {
			throw new Error('Invalid quantity to add to cart : ' + qty);
		}

		const productId = product.id;
		let item = this._items[productId];
		if (!item) {
			item = this._items[productId] = { product, qty: 0 };
		}

		item.qty += qty;

		// update the total quantity and price
		this._totalQty += qty;
		this._totalPrice += qty * product.price;
	}

	remove (product, qty = 1) {
		if (qty === 'all') {
			qty = Number.MAX_VALUE;
		}
		if (qty <= 0) {
			throw new Error('Invalid quantity to add to cart : ' + qty);
		}

		const productId = product.id;
		const item = this._items[productId];

		if (item) {
			const oldQty = item.qty;
			item.qty = Math.max(0, oldQty - qty);
			// remove the whole item if there's no products in it
			if (item.qty === 0) {
				delete this._items[productId];
			}

			// sanitize the removed items - they cannot be more than they has been
			const removedItems = Math.min(oldQty, qty);
			// sanitize the total quantity and price it cannot be negative
			this._totalQty = Math.max(0, this._totalQty - removedItems);
			this._totalPrice = Math.max(0, this._totalPrice - removedItems * product.price);
		}
	}

	toJSON () {
		return {
			items: this._items,
			totalQty: this._totalQty,
			totalPrice: this._totalPrice,
		};
	}

	toProto () {

	}

	toString () {
		return `Cart - totalQuantity: ${this._totalQty}, totalPrice: ${this._totalPrice}`;
	}

}


module.exports = Cart;
