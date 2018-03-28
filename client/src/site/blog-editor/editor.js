import './editor.less';

import Vue from 'vue';
import PostEditor from './PostEditor';

new Vue({
	el: '#app-blog-editor',
	components: {
		'app-post-editor': PostEditor,
	},
});
