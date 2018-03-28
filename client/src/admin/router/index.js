import Vue from 'vue';
import VueRouter from 'vue-router';

import FileUpload from '../components/fileupload/FileUpload.vue';
import Gallery from '../components/gallery/Gallery.vue';
import Enquiry from '../components/notify/Enquiry.vue';
import Order from '../components/notify/Order.vue';

// register the VueRouter plugin in Vue
Vue.use(VueRouter);

const routes = [
	{ path: '/fileupload', component: FileUpload },
	{ path: '/gallery', component: Gallery },
	{
		path: '/notify',
		component: {
			template: `
				<b-container>
					<h1>Test notification for {{ $route.name }}</h1>
					<router-view></router-view>
				</b-container>
			`,
		},
		children: [
			{ path: 'enquiry', name: 'Enquiry', component: Enquiry },
			{ path: 'order', name: 'Order', component: Order },
		],
	},
];

// the server is configured to always serve the admin SPA page and so the client will handle the routing
const router = new VueRouter({
	base: '/admin',
	mode: 'history',
	routes,
});

export { router as default };
