<template>
  <!-- appear appear-active-class="animated tada" -->
  <transition v-bind:css="animate" enter-active-class="animated tada" leave-active-class="animated bounceOutRight">
		<b-list-group-item>
			<a v-bind:href="item.file.url" download>{{ item.name }}</a>
			<b-button variant="danger" v-on:click.prevent="onRemove(item)" class="float-right">Delete</b-button>
		</b-list-group-item>class="float-left"
	</transition>
</template>

<script>
export default {
  props: {
    item: { type: Object, required: true },
    animate: { type: Boolean, default: false }
  },
  methods: {
    onRemove(item) {
      // emit event to the parent - let it handle the action for removing and later updating the store
      // e.g I'd prefer this component to stay as presentation only
      this.$emit("upload-list-item:remove");
    }
  }
};
</script>

