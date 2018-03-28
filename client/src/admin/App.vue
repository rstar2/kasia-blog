<template>
  	<div id="app">
			<b-navbar toggleable="md" type="dark" variant="info">
				<b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
				<b-navbar-brand to="/">{{brand}} - Admin</b-navbar-brand>

				<b-collapse is-nav id="nav_collapse">
					<b-navbar-nav>
						<b-nav-item to="/fileupload">FileUploads</b-nav-item>
						<b-nav-item to="/gallery">Gallery</b-nav-item>
						<b-nav-item-dropdown text="Notify">
							<b-dropdown-item to="/notify/enquiry">Enquiry</b-dropdown-item>
							<b-dropdown-item to="/notify/order">Order</b-dropdown-item>
						</b-nav-item-dropdown>
					</b-navbar-nav>

					<!-- Right aligned nav items -->
					<b-navbar-nav class="ml-auto">
						<app-auth></app-auth>
					</b-navbar-nav>
				</b-collapse>
			</b-navbar>

			<!--
				Pass the Router a key (he full path) - so that it will not play smart and reuse
				components between routes when they are the same. Let them be created from scratch.
				This is a little overhead for the compnentents BUT much more-predictable and safe.
			 -->
			<router-view :key="$router.fullPath"></router-view>

			<BlockUI v-show="blockUI.isEnabled" v-bind="blockUI">
				<!-- <div class="spinnerWrap" style="
						display: flex; align-items: center; justify-content: center;
            height: 15rem;
            margin-bottom: 5rem;">
					<spinner :status="true" color="#4fc08d" :size="200"></spinner>
				</div> -->
			</BlockUI>

	</div>
</template>

<script>
import AppAuth from "./components/auth/Auth";

export default {
  props: {
    brand: {
      type: String,
      default: ""
    },
    isAuthInit: {
      type: Boolean,
      default: false
    },
    /* All blockUI props are repassed */
    blockUI: {
      type: Object,
      // object/array defaults should be returned from a factory function
      default: function() {
        return {};
      }
    }
  },
  components: {
    "app-auth": AppAuth
  }
};
</script>

