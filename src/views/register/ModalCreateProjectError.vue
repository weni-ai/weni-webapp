<template>
  <UnnnicModal
    :text="$t('register.modals.fail.title')"
    :description="$t('register.modals.fail.description')"
    modalIcon="warning"
    scheme="aux-red-500"
    @close="$emit('close')"
  >
    <section v-if="props.error">{{ error }}</section>
  </UnnnicModal>
</template>

<script setup>
defineEmits(['close']);
const props = defineProps({ error: { type: String, default: '' } });
</script>
