<template>
  <div id="paypal-button-container">
		<BlockUI v-show="!isEnabled"></BlockUI>
	</div>
</template>


<script>
/* globals paypal */

import Vue from "vue";
import BlockUI from "vue-blockui";
Vue.use(BlockUI);

import { PAYPAL_STATE } from "./index";

export default {
  props: {
    mode: {
      type: String,
      required: true
    },
    createUrl: {
      type: String,
      required: true
    },
    executeUrl: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    createData: {
      type: Object,
      required: true
    }
  },
  computed: {
    isEnabled: function() {
      return this.state === PAYPAL_STATE.READY;
    }
  },
  mounted() {
    const vm = this;
    paypal.Button.render(
      {
        // sandbox | production
        env: vm.mode || "sandbox",

        // Show the buyer a 'Pay Now' button in the checkout flow
        commit: true,

        // Specify the style of the button
        style: {
          label: "pay", // checkout | credit | pay | buynow | paypal
          fundingicons: true, // optional
          // branding: true,     // optional
          // layout: 'vertical', // horizontal | vertical
          size: "responsive" // small | medium | large | responsive
          // shape: 'rect',      // pill | rect
          // color: 'blue',      // gold | blue | silver | black,
          // tagline: true,
        },

        /**
         * Called when the button is clicked
         */
        payment: function(data, actions) {
          if (!vm.isEnabled) {
            return Promise.reject("Not enabled");
          }

          vm.$emit("state-changed", { state: PAYPAL_STATE.STARTED });

          // re-pass the data coming from the parent
          const params = { ...vm.createData };

          // Make a call to the server to set up the payment
          return paypal.request.post(vm.createUrl, params).then(function(res) {
            vm.$emit("state-changed", { state: PAYPAL_STATE.CREATED });
            return res.paymentID;
          });
        },

        /**
         * Called when the buyer approves the payment
         */
        onAuthorize: function(data, actions) {
          // // Get the payment and buyer details
          // return actions.payment.get().then(function(payment) {
          // 	console.log('Payment details:', payment);
          // });

          // Set up the data you need to pass to your server
          const params = {
            paymentID: data.paymentID,
            payerID: data.payerID
          };

          // Make a call to your server to execute the payment
          return paypal.request.post(vm.executeUrl, params).then(function(res) {
            vm.$emit("state-changed", { state: PAYPAL_STATE.SUCCESS });
          });
        },

        /**
         * Called for every click on the PayPal button.
         * For instance fire off any analytics beacons from here
         */
        onClick: function() {
          // Google analytics example (taken from https://developers.google.com/analytics/devguides/collection/analyticsjs/events)
          // ga('send', {
          // 	hitType: 'event',
          // 	eventCategory: 'Checkout',
          // 	eventAction: 'button_click'
          // });
        },

        /**
         * called when a buyer cancelled the payment
         */
        onCancel: function(data, actions) {
          vm.$emit("state-changed", { state: PAYPAL_STATE.CANCELED });
        },

        /**
         * Called when an error occurred during the transaction
         */
        onError: function(error) {
          vm.$emit("state-changed", { state: PAYPAL_STATE.FAILED, error: parseError(error.message) });
        }
      },
      "#paypal-button-container"
    );
  }
};

/**
 * @param {String} error
 */
function parseError(error) {
  // this is a possible format if we return JSON:
  // Request to post /shop/checkout/paypal/payment/execute failed with 500 error. Correlation id: unknown
  //
  // {
  //     "error": "Shipping country code is not verified by the selected zone"
  // }

  const startJSON = error.indexOf("{");
  if (startJSON > 0) {
    const endJSON = error.lastIndexOf("}");
    if (endJSON > 0) {
      const errorJSONStr = error.substring(startJSON, endJSON+1).trim();
      const errorJSON = JSON.parse(errorJSONStr);
      error = errorJSON.error || error;
    }
  } else {
    // wil assume a plain text:
    const startPlain = error.indexOf("\n");
    if (startPlain > 0) {
      error = error.substr(startPlain).trim();
    }
	}
	
	return error;
}
</script>


