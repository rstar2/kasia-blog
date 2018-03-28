export function showAlert (success, { vm, alert, successAlert, failAlert } = {}) {
	// allow if not passed explicitly 'alert' property,
	// to use 'successAlert' or 'failAlert' accordingly
	alert = alert || (success ? successAlert : failAlert);

	if (vm && alert) {
		vm.$root.$emit('showAlert', {
			msg: alert,
			type: success ? 'info' : 'danger',
			timeout: success ? 3 : undefined,
		});
	}
};
