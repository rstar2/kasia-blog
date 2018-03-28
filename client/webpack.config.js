const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const options = {
	entry: {
		// this is for bundling only Vue, Bootstrap and BootstrapVue
		'boot': './src/boot.js',

		// this is bundle for the custom admin SPA pages
		'admin': './src/admin',

		// this is the common bundle for all main/client site pages
		// mainly CSS/LESS files for the main site and also registering common  Vue components
		'site': './src/site',

		// these are bundles for a specific main/client site page
		'blog-editor': './src/site/blog-editor',
		'post': './src/site/post',
		'shop-cart': './src/site/shop-cart',
	},
	output: {
		path: path.resolve(__dirname, '../public/js'),
		publicPath: '/public/js',
		filename: 'build.[name].js',
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
					},
					// other vue-loader options go here
				},
			},


			// {
			// 	test: /\.css$/,
			// 	use: [
			// 		'vue-style-loader',
			// 		'css-loader',
			// 	],
			// },
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: 'css-loader',
				}),
			},
			{
				test: /\.less$/,
				use: ExtractTextPlugin.extract({
					// use style-loader in development
					fallback: 'style-loader',
					use: ['css-loader', 'less-loader'],
				}),
			},

			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},

			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]?[hash]',
					outputPath: '../images',
					publicPath: '/public/images',
				},
			},
		],
	},
	resolve: {
		alias: {
			vue$: 'vue/dist/vue.esm.js',
		},
		extensions: ['*', '.js', '.vue', '.json'],
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true,
		overlay: true,
	},
	performance: {
		hints: false,
	},
	plugins: [
		// extract the 'boot' entry, the one containing Vue, Bootstrap and BootstrapVue as
		// it will be included in every page
		new webpack.optimize.CommonsChunkPlugin({
			name: 'boot',
			// minChunks: function (module, count) {
			//   // any required modules inside node_modules are extracted to vendor
			//   return (
			// 	module.resource &&
			// 	/\.js$/.test(module.resource) &&
			// 	module.resource.indexOf(
			// 	  path.join(__dirname, '../node_modules')
			// 	) === 0
			//   )
			// }
		}),

		// extract CSS nad LESS into own files
		new ExtractTextPlugin({ filename: '../styles/build.[name].css' }),

		// copy custom static files
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, './static'),
				to: '../',
				ignore: ['.*'],   //ignore dot-files like .gitkeep
			},
		]),
	],
	devtool: '#eval-source-map',
};

if (process.env.NODE_ENV === 'production') {
	// mp source-map
	options.devtool = false;


	options.plugins = (options.plugins || []).concat([
		// http://vue-loader.vuejs.org/en/workflow/production.html
		// https://vuejs.org/v2/guide/deployment.html
		// Run Vue.js in production mode - less warnings and etc...
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"',
			},
		}),

		// Uglify and compress
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: !!options.devtool,
			compress: {
				warnings: false,
			},
		}),

		// The LoaderOptionsPlugin is unlike other plugins in that
		// it is built for migration from webpack 1 to 2
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	]);
}

module.exports = options;
