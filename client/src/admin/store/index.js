import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';

// register the Vuex plugin
Vue.use(Vuex);

// TODO: split the state/mustations/actions into modules
const state = {
	fileuploads: [],
	isFileuploadsLoaded: false,

	isAuth: false,
};

const getters = {
	fileuploads (state) {
		return state.fileuploads;
	},
	// to all getters the state is always passed for us from Vuex
	fileuploadsCount (state) {
		return state.fileuploads.length;
	},
	isFileuploadsLoaded (state) {
		return state.isFileuploadsLoaded;
	},

	isAuth (state) {
		return state.isAuth;
	},
};

// 'mutations' are/SHOULD BE synchronous
// they are like "transactions" and only they are allowed to mutate the state
const mutations = {
	// the 'state' is always the first argument and a payload is always the second
	// so usage is:
	// store.commit('fileuploadAdd', item)
	// but it's good practice to pass the payload as object so that multiple fields can be passed
	// especially when using destructuring- store.commit('fileuploadAdd', { item })
	fileuploadAdd (state, { item }) {
		// mutate
		state.fileuploads.unshift(item);
	},

	fileuploadRemove (state, { item }) {
		// mutate
		const index = state.fileuploads.indexOf(item);
		if (index !== -1) {
			state.fileuploads.splice(index, 1);
		}
	},

	fileuploadsSet (state, { items }) {
		// replace the whole list
		state.fileuploads = items;
	},

	fileuploadsLoaded (state) {
		// only loaded state
		state.isFileuploadsLoaded = true;
	},

	authChange (state, { isAuth }) {
		state.isAuth = isAuth;
	},
};

const store = new Vuex.Store({
	state,
	getters,
	mutations,
	actions,
	strict: process.env.NODE_ENV !== 'production',
});


export default store;
