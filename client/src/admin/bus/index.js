import Vue from 'vue';

// Dynamically add components:
// See https://css-tricks.com/creating-vue-js-component-instances-programmatically/
// See https://codesandbox.io/embed/4l3w20zomw

// this is Vue component-template (as plain JS Object)
import bAlert from 'bootstrap-vue/es/components/alert/alert';
// this is a Vue component-constructor (as JS Function)
const BAlert = Vue.extend(bAlert);

export function registerBusEvents (vmRoot) {
	vmRoot.$on('authChanged', function ({ isAuth }) {
		console.log('Bus: Authorization changed', isAuth);

		this.$emit('showAlert', {
			type: isAuth ? 'success' : 'danger',
			msg: `You've been signed ${isAuth ? 'in' : 'out'}`,
			timeout: 3,
		});
	});

	vmRoot.$on('showAlert', function ({ type = 'info', msg, timeout = 0 }) {
		console.log('Bus: Show alert');

		// create new instance
		// <b-alert show dismissible ref="alert" @dismissed="dismissed($refs.alert)">Alert</b-alert>
		const vmAlert = new BAlert({
			propsData: {
				show: timeout || true, // show as self-dismissible if valid timeout is set
				dismissible: true,
				variant: type,
			},
		});
		vmAlert.$slots.default = [msg];  // or just msg if this is a single element slot

		// the template will be rendered as an off-document element,
		// and you will have to use native DOM API to insert it into the document yourself.
		vmAlert.$mount();

		vmAlert.$el.classList.add('animated', 'bounceInRight');

		vmAlert.$on('dismissed', function () {
			// this is vmAlerts

			// this will prevent the BAlert to render the component as 'comment' in the DOM
			// e.g it will stay visible so that I can apply the "animated" CSS animation
			this.dismissed = false;
			this.$el.classList.remove('bounceInRight');
			this.$el.classList.add('bounceOutRight');
			// finally destroy the component and remove it from the DOM
			// as '$destroy' don't remove the element from the DOM, just destroys all Vue stuff
			setTimeout(() => {
				this.$destroy();
				this.$el.remove();
			}, 500);
		});

		// add it to the DOM where needed
		this.$el.appendChild(vmAlert.$el);
	});


	vmRoot.$on('blockUI', function ({ isEnabled = false, message = '', url, html }) {
		console.log('Bus: BlockUI changed', isEnabled);

		// just update the root-component's 'blockUI' data property
		// it will in tern update the responsible child (currently the App.vue)
		this.blockUI.isEnabled = isEnabled;
		this.blockUI.message = message;
		this.blockUI.url = url;
		this.blockUI.html = html;
	});
};
