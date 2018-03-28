import './comments.less';

import fontawesome from '@fortawesome/fontawesome';
import faTrash from '@fortawesome/fontawesome-free-solid/faTrash';
fontawesome.library.add(faTrash);


import Vue from 'vue';

new Vue({
	el: '#app-comment-form',

	data: {
		comment: '',
	},

});
