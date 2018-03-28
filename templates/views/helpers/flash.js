const _ = require('lodash');
const hbs = require('handlebars');

module.exports = {
	//  ### Flash Message Helper
	//  KeystoneJS supports a message interface for information/errors to be passed from server
	//  to the front-end client and rendered in a html-block.  FlashMessage mirrors the Pug Mixin
	//  for creating the message.  But part of the logic is in the default.layout.  Decision was to
	//  surface more of the interface in the client html rather than abstracting behind a helper.
	//
	//  @messages:[]
	//
	//  *Usage example:*
	//  `{{#if messages.warning}}
	//      <div class="alert alert-warning">
	//          {{{flashMessages messages.warning}}}
	//      </div>
	//   {{/if}}`
	flashMessages: function (messages, options) {
		let output = '';
		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];
			if (_.isString(message)) {
				output += '<div>' + message + '</div>';
			} else {
				if (message.title) {
					output += '<h4>' + message.title + '</h4>';
				}

				if (message.detail) {
					output += '<p>' + message.detail + '</p>';
				}

				if (message.list) {
					output += '<ul>';
					for (let ctr = 0; ctr < message.list.length; ctr++) {
						output += '<li>' + message.list[ctr] + '</li>';
					}
					output += '</ul>';
				}
			}
		}
		return new hbs.SafeString(output);
	},
};
