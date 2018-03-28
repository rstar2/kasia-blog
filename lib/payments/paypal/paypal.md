# PayPal payment methods

## Classic Payment Button

See:
1. https://developer.paypal.com/docs/integration/web/

Using special PayPal button inside 
```<FORM action="https://www.paypal.com/cgi-bin/webscr" method="post">```
No server side - payments are created and handled entirely from the client.
This method is used like in www.flippcrashpads.com.
Multiple options can be specified (e.g. for additional shipping prices and etc.), all the order's info will be available in from the PayPal business account (e.g. the seller account).
Shop's logo and etc can be added in the PayPal business account settings to customize the checkout view of PayPal

## Express Checkout using REST API 

See:
1. https://developer.paypal.com/docs/integration/direct/express-checkout/integration-jsv4/
1. https://www.youtube.com/watch?v=7k03jobKGXM
1. https://github.com/paypal/PayPal-node-SDK
1. https://developer.paypal.com/developer/accounts
1. https://www.sandbox.paypal.com/signin

### Client Side Express Checkout using REST
The payment is created and executed by the client when clicking the PayPal button:
For this the PayPal Client ID (from the created PayPal app) should be set.
Note the actions taken in the *payment()* and the *onAuthorize()* callback implementations

```
<script>
        paypal.Button.render({

            env: 'sandbox', // sandbox | production

            // PayPal Client IDs - replace with your own
            // Create a PayPal app: https://developer.paypal.com/developer/applications/create
            client: {
                sandbox:    '<insert sandbox client id>',
                production: '<insert production client id>'
            },

            // Show the buyer a 'Pay Now' button in the checkout flow
            commit: true,

            // payment() is called when the button is clicked
            payment: function(data, actions) {

                // Make a call to the REST api to create the payment
                return actions.payment.create({
                    payment: {
                        transactions: [
                            {
                                amount: { total: '0.01', currency: 'USD' }
                            }
                        ]
                    }
                });
            },

            // onAuthorize() is called when the buyer approves the payment
            onAuthorize: function(data, actions) {

                // Make a call to the REST api to execute the payment
                return actions.payment.execute().then(function() {
                    window.alert('Payment Complete!');
                });
            }

        }, '#paypal-button-container');

    </script>
```	


### Server Side Express Checkout using REST
### Express Checkout using Braintree SDK
