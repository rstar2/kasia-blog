<template>
 	 <b-container>
		<h1>Upload a new file</h1>
		<form>
			<div>
				<!-- Accept all image formats by IANA media type wildcard-->
				<b-form-file v-model="file" accept="image/*" placeholder="Choose a file..." class="mb-2"></b-form-file>	
				<b-form-input v-model.trim="name" type="text" placeholder="Enter your name" class="mb-2"></b-form-input>
			</div>
			<b-row class="align-items-center">
				<b-col sm="auto" class="pr-0">
					<b-button variant="success" v-on:click.prevent="onUpload" v-bind:disabled="!file">Upload</b-button>
				</b-col>
				<b-col>
					<b-progress v-if="uploading" :value="uploadProgress"></b-progress>
				</b-col>
			</b-row>
		</form>
	</b-container>
</template>


<script>
export default {
  data() {
    return {
      name: "Name",
      file: null,
      uploadProgress: 0,
      uploading: true
    };
  },
  methods: {
    onUpload() {
      this.uploadProgress = 0;
      this.uploading = true;
      this.$store
        .dispatch("fileUploadCreate", {
          file: this.file,
          name: this.name,
          onUploadProgress: event => {
            // progress listener
            this.uploadProgress = Math.round(event.loaded / event.total * 100);
          },
          apiProps: {
            vm: this,
            failAlert: "Failed to create a new file-upload"
          }
        })
        .then(() => (this.uploading = false));
    }
  }
};
</script>
