<template>
  <unnnic-tab v-model="activeTab" :tabs="['template', 'blank']">
    <template slot="tab-head-template">
      {{ $t('template_gallery.tabs.template.title') }}
    </template>

    <template slot="tab-panel-template"></template>

    <template slot="tab-head-blank">
      {{ $t('template_gallery.tabs.blank.title') }}
    </template>

    <template slot="tab-panel-blank"></template>
  </unnnic-tab>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'template',
    };
  },
};
</script>
