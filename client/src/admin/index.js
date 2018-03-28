// add the Promise and 'fetch' polyfills
import 'promise-polyfill/src/polyfill'; // polyfill if native don't exist
import 'whatwg-fetch';

import 'animate.css';

// just to show that CSS and LESS loading, compiling and packaging works by Webpack
import './index.css';
import './index.less';

import Vue from 'vue';

import store from './store';
import router from './router';

// A block-ui plugin for Vue
// Used: https://github.com/realdah/vue-blockui
import BlockUI from 'vue-blockui';
Vue.use(BlockUI);

import Spinner from 'vue-spinner-component/src/Spinner';
Vue.component('spinner', Spinner);

// the main component
import App from './App';

// the root component will be registered as a common Bus
// that will listen for any kind of events that are not state-related
// like currently showing of alerts
import { registerBusEvents } from './bus';

import { blockUIDefaults as blockUI } from './services/blockui';

new Vue({
	el: '#app',
	data: {
		// blockUI properties - see BlockUI component
		// NOTE!!! - all blockUI_props must be declared in front in order the Vue reactivity to handle them
		// blockUI: {
		// 	isEnabled: undefined,
		// 	message: undefined,
		// 	url: undefined,
		// 	html: undefined,
		// },
		blockUI: { ...blockUI },
	},
	store,
	router,
	created () {
		registerBusEvents(this);

		// get the initial values from the original element HTML5 dataset
		const el = document.querySelector(this.$options.el);
		const data = el.dataset;
		const brand = data.brand;
		// convert the string to boolean
		const isAuthInit = data.isAuthInit === 'true';

		// commit it to the store the initial auth state
		// Note - it's straight commit - not dispatching an action
		this.$store.commit('authChange', { isAuth: isAuthInit });

		// one time fields - not reactive
		this.props = { brand, isAuthInit };
	},
	render (createElement) {
		return createElement(App, { props: { ...this.props, blockUI: this.blockUI } });
	},
});
