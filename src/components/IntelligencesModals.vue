<template>
  <div>
    <unnnic-modal-next
      v-if="$route.name === 'bothub' && flowCount === 0"
      type="alert"
      :title="$t('intelligences.modals.cant_access.title')"
      icon="app-window-edit-1"
      scheme="brand-weni-soft"
      :action-primary-label="
        $t('intelligences.modals.cant_access.button_primary_label')
      "
      action-primary-button-type="secondary"
      @click-action-primary="
        $router.push({
          name: 'push',
          params: {
            projectUuid: $store.getters.currentProject.uuid,
            internal: ['init'],
          },
        })
      "
    >
      <span
        slot="description"
        v-html="$t('intelligences.modals.cant_access.description')"
      ></span>
    </unnnic-modal-next>

    <unnnic-modal-next
      v-if="showHowToIntegrate"
      type="alert"
      :title="$t('intelligences.modals.how_to_integrate.title')"
      icon="science-fiction-robot-2"
      scheme="brand-weni-soft"
      show-close-button
      @close="showHowToIntegrate = false"
    >
      <span
        slot="description"
        v-html="$t('intelligences.modals.how_to_integrate.description')"
      ></span>
    </unnnic-modal-next>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showHowToIntegrate: false,
    };
  },

  computed: {
    flowCount() {
      return this.$store.getters.currentProject?.flow_count || 0;
    },

    projectUuidAndFlowCount() {
      return [
        this.$store.getters.currentProject?.uuid,
        this.flowCount,
        this.$route.name,
      ].join(':');
    },
  },

  watch: {
    projectUuidAndFlowCount: {
      immediate: true,

      handler() {
        if (
          !this.$store.getters.currentProject?.uuid ||
          this.$route.name !== 'bothub'
        ) {
          return;
        }

        let data = {};

        try {
          data = JSON.parse(
            localStorage.getItem('tutorials:howToIntegrateAI') || '[]',
          );

          const projectUuid = this.$store.getters.currentProject.uuid;

          if (this.flowCount >= 1 && !data.includes(projectUuid)) {
            this.showHowToIntegrate = true;

            data.push(projectUuid);

            localStorage.setItem(
              'tutorials:howToIntegrateAI',
              JSON.stringify(data),
            );
          }
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
};
</script>
