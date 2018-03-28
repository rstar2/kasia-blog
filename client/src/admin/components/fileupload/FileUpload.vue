<template>
  	<div>
    	<app-upload-new/>
		<hr>
		<app-upload-list/>
  </div>
</template>

<script>
import FileUploadNew from "./FileUploadNew.vue";
import FileUploadList from "./FileUploadList.vue";

export default {
  components: {
    "app-upload-new": FileUploadNew,
    "app-upload-list": FileUploadList
  },
};
</script>
