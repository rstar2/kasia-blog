// with the Slot I'll reuse the whole element as it's written in the HTML before Vue to compile it
// just an additional link/button will be added
<template>
	<div style="position: relative;" @mouseenter="style.opacity=1" @mouseleave="style.opacity=0">
		<slot></slot>
		<a class="ks-editable-btn" target="_blank" :href="href" :style="style">{{label}}</a>
	</div>
</template>

<script>
export default {
  data() {
    return {
      href: "",
      label: "",
      style: {
        opacity: 0,
        top: 0,
        right: 0
      }
    };
  },
  mounted() {
	  // get the "data-ks-editable" attribute as HTML5 data-attribute - e.g. as camelCased
    const data = JSON.parse(this.$el.dataset.ksEditable);

    switch (data.type) {
      case "list":
        this.href = data.path;
        this.label = "Manage " + data.plural;

        if (data.id) {
          this.href += "/" + data.id;
          this.label = "Edit " + data.singular;
        }
        break;

      case "content":
      case "error":
        // TODO
        break;
    }
  }
};
</script>

			