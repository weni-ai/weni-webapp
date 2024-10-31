<template>
  <section>
    <UnnnicDropArea
      :currentFiles="files"
      supportedFormats=".pdf,.doc,docx,.txt,.xls,.xlsx"
      :maxFileSize="250"
      :maximumUploads="100"
      :acceptMultiple="true"
      @update:current-files="$emit('update:files', $event)"
      @unsupported-format="showUnsupportedFormatAlert"
      @exceeded-the-maximum-file-size-limit="showExceededFileSizeLimitAlert"
      @click.stop
    >
      <template #title>
        {{ $t('brain.file_importer.drag_or_click_to_search') }}
      </template>

      <template #subtitle>
        <span v-html="$t('brain.file_importer.supported_formats')" />
      </template>
    </UnnnicDropArea>

    <section class="files">
      <UnnnicImportCard
        v-for="(file, index) in files"
        :key="index"
        class="files__file"
        :title="file.name"
        :canImport="false"
        @delete="deleteFile(file)"
      />
    </section>

    <UnnnicAlert
      v-if="alert"
      v-bind="alert"
      @close="alert = null"
    />
  </section>
</template>

<script>
export default {
  props: {
    files: [],
  },

  data() {
    return {
      alert: null,
    };
  },

  methods: {
    showUnsupportedFormatAlert() {
      this.alert = {
        type: 'error',
        text: this.$t('brain.file_importer.messages.unsupported_format'),
      };
    },

    showExceededFileSizeLimitAlert() {
      this.alert = {
        type: 'error',
        text: this.$t('brain.file_importer.messages.exceeds_limit'),
      };
    },

    deleteFile(file) {
      this.$emit(
        'update:files',
        this.files.filter((item) => item !== file),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.files {
  margin-top: $unnnic-spacing-ant;

  &__file + &__file {
    margin-top: $unnnic-spacing-nano;
  }
}
</style>
