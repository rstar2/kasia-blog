import * as api from '../services/api';

import { showAlert } from '../services/alert';

function fileUploadCreate (context, { file, name, onUploadProgress, apiProps }) {
	if (!context.state.isAuth) {
		showAlert(false, apiProps);
		return Promise.reject('Not Authorized yet');
	}

	// file -This is the raw file that was selected
	// name - This is the name of the FileUpload
	return api.upload('/api/fileupload/create', { file, name }, onUploadProgress, apiProps)
		.then(data => {
			context.commit('fileuploadAdd', { item: data.item });
		});
}

function fileUploadRemove (context, { item, apiProps }) {
	if (!context.state.isAuth) {
		showAlert(false, apiProps);
		return Promise.reject('Not Authorized yet');
	}

	return api.get(`/api/fileupload/${item.id}/remove`, apiProps)
		.then(() => {
			context.commit('fileuploadRemove', { item });
		});
}

function fileUploadList (context, { apiProps } = {}) {
	if (!context.state.isAuth) {
		showAlert(false, apiProps);
		return Promise.reject('Not Authorized yet');
	}

	// load all current file-uploads
	return api.get('/api/fileupload/list', apiProps)
		.then(data => {
			const items = data.items;
			context.commit('fileuploadsSet', { items });

			context.commit('fileuploadsLoaded');
		});
}

function authSignIn (context, { username, password, apiProps }) {
	if (context.state.isAuth) {
		return Promise.resolve();
	}

	return api.post('/api/auth/signin', { username, password }, apiProps)
		.then(() => {
			// commit/change the isAuth state
			context.commit('authChange', { isAuth: true });
		});
}

function authSignOut (context, { apiProps } = {}) {
	if (!context.state.isAuth) {
		return Promise.resolve();
	}

	return api.get('/api/auth/signout', apiProps)
		.then(() => {
			// commit/change the isAuth state
			context.commit('authChange', { isAuth: false });
		});
}


// on the other hand actions can be asynchronous
// and finally they can commit mutations that finally update the state
export default {
	fileUploadCreate, fileUploadRemove, fileUploadList,
	authSignIn, authSignOut,
};
