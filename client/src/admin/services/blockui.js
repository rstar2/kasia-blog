

export const blockUIDefaults = {
	isEnabled: false,
	message: null, // 'Loading...',
	url: null,

	// simple usage of a FontAwesome spinner
	// More crazy examples can be added from http://tobiasahlin.com/spinkit/
	html: '<i class="fas fa-spinner fa-3x fa-fw fa-spin"></i>',
};

export function blockUI (isEnabled, vm, blockUI) {
	if (vm) {
		// apply the defaults first then the custom, and finally the enabled state
		vm.$root.$emit('blockUI', { ...blockUIDefaults, ...blockUI, isEnabled });
	}
}
