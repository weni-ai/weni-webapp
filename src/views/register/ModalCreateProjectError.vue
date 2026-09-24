<template>
  <UnnnicDialog v-model:open="open">
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle>{{
          $t('register.modals.fail.title')
        }}</UnnnicDialogTitle>
      </UnnnicDialogHeader>
      <section class="modal-create-project-error__description">
        <p>{{ $t('register.modals.fail.description') }}</p>
        <p v-if="props.error">{{ props.error }}</p>
      </section>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
const open = defineModel('open', { type: Boolean, default: false });
const props = defineProps({ error: { type: String, default: '' } });
</script>

<style lang="scss" scoped>
.modal-create-project-error__description {
  padding: $unnnic-space-6;

  font: $unnnic-font-emphasis;
  color: $unnnic-color-fg-emphasized;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  > * {
    margin: 0;
  }
}
</style>
