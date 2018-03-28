<template>
	<form validated @submit.prevent="test">
		<b-row class="w-75">
			<b-col cols="12" md="6">
				<b-form-input v-model.trim="name.first" type="text" placeholder="First Name" class="mb-2"></b-form-input>
			</b-col>
			<b-col cols="12" md="6">
				<b-form-input v-model.trim="name.last" type="text" placeholder="Last Name" class="mb-2"></b-form-input>
			</b-col>
			<b-col cols="12" md="6">
				<b-form-input v-model.trim="phone" type="tel" placeholder="Your phone" class="mb-2"></b-form-input>
			</b-col>
			<b-col cols="12" md="6">
				<b-form-input v-model.trim="email" type="email" required placeholder="Your email" class="mb-2"></b-form-input>
			</b-col>
			
			<b-col cols="12">
				<b-form-textarea v-model.trim="shippingAddress" :rows="3" type="text" required placeholder="Shipping address" class="mb-2"></b-form-textarea>
			</b-col>
			<b-col cols="12" md="6">
				<b-form-input v-model.trim="zone" :rows="3" type="number" required placeholder="Zone" class="mb-2"></b-form-input>
			</b-col>
			<b-col cols="12" md="6">
				<b-form-input v-model.trim="totalPrice" :rows="3" type="number" required placeholder="Price" class="mb-2"></b-form-input>
			</b-col>
			
			<b-col cols="12" class="mb-2">
				<b-form-checkbox v-model="isSMS" @change="totalPrice++">SMS</b-form-checkbox>
			</b-col>
			
			<b-col cols="auto">
				<b-button variant="success" type="submit">Test</b-button>
			</b-col>
		</b-row>
	</form>
</template>

<script>
import * as api from "../../services/api";

export default {
  data() {
    return {
      isSMS: true,
      name: {
        first: "",
        last: ""
      },
      phone: "",
      email: "",

      shippingAddress: "",
      zone: 0,
      totalPrice: 0
    };
  },
  methods: {
    test() {
      api.post("/api/notify/enquiry/email", this.$data, {
        vm: this,
        successAlert: "Test email sent",
        failAlert: "Failed to send test email"
      });
    }
  }
};
</script>
