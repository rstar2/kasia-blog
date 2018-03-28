<template>
	<div>
    	<b-button @click="showModal" :disabled="loading">{{ action }}</b-button>
    	<b-modal ref="myModalRef" :title="action" 
			centered hide-footer no-close-on-backdrop hide-header-close
			@show="beforeShow" @hide="beforeHide"
			id="app-admin-auth-modal">

			<b-row align-h="center" align-v="center"> <!-- e.g. class="justify-content-center align-items-center" -->
        		<b-col cols="auto" v-show="loading" class="mb-2">
					<i class="fas fa-spinner fa-spin"></i>
				</b-col>
				<b-col v-if="error">
					<b-alert show variant="danger">{{ error }}</b-alert>
				</b-col>
			</b-row>

			<div v-if="!isAuth" class="d-block text-center">
        		<b-form-input v-model.trim="email" type="text" placeholder="Email" class="mb-2"></b-form-input>
        		<b-form-input v-model.trim="password" type="password" placeholder="Password" class="mb-2"></b-form-input>
      		</div>
			<b-btn class="mt-3" variant="outline-success" block @click="doAction" :disabled="loading">{{ action }}</b-btn>
			<b-btn class="mt-3" variant="outline-danger" block  @click="hideModal">Close</b-btn>				
    	</b-modal>
  	</div>
</template>

<script>
import isUndefined from "lodash/isUndefined";

// import the Spinner FontAwesome icon
import fontawesome from "@fortawesome/fontawesome";
import faSpinner from "@fortawesome/fontawesome-free-solid/faSpinner";
fontawesome.library.add(faSpinner);

import { mapGetters } from "vuex";

const classAnimated = "animated";
const classAnimatedIn = "slideInRight";
const classAnimatedOut = "slideOutRight";

export default {
  data() {
    return {
      loading: false,
      error: null,

      email: null,
      password: null
    };
  },

  computed: {
    ...mapGetters(["isAuth"]),
    action() {
      return this.isAuth ? "Sign Out" : "Sign In";
    }
  },

  // change the show animation
  created: function created() {
    // non-reactive property - once created
    this.modalDialogEl = null;
  },
  mounted() {
    const modalEl = this.$refs.myModalRef.$el;

    this.modalDialogEl = modalEl.querySelector(
      "#app-admin-auth-modal .modal-dialog"
    );
    this.modalDialogEl.classList.add(classAnimated);
  },

  watch: {
    isAuth(newValue) {
      this.$root.$emit("authChanged", { isAuth: newValue });
    }
  },

  methods: {
    setState({ loading, error }) {
      if (!isUndefined(loading)) {
        this.loading = loading;
      }
      if (!isUndefined(error)) {
        this.error = error;
      }
    },

    showModal() {
      this.setState({ error: null });
      this.$refs.myModalRef.show();
    },
    hideModal() {
      this.$refs.myModalRef.hide();
    },

    doAction() {
      this.setState({ loading: true, error: null });

      const action = this.isAuth
        ? { type: "authSignOut" }
        : { type: "authSignIn", username: this.email, password: this.password };
      this.$store
        .dispatch(action)
        .then(() => {
          this.setState({ loading: false });
          this.hideModal();
        })
        .catch(() =>
          this.setState({
            loading: false,
            error: `Failed to sign ${this.isAuth ? "out" : "in"}`
          })
        );
    },

    // change the show animation
    beforeShow() {
      this.modalDialogEl.classList.remove(classAnimatedOut);
      this.modalDialogEl.classList.add(classAnimatedIn);
    },

    beforeHide() {
      this.modalDialogEl.classList.remove(classAnimatedIn);
      this.modalDialogEl.classList.add(classAnimatedOut);
    }
  }
};
</script>

<style>
.modal.fade {
  transition: opacity 0.5s linear;
}

.modal.fade .modal-dialog {
  -webkit-transform: translate(0);
  -moz-transform: translate(0);
  transform: translate(0);
}
</style>

