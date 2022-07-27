<template>
  <div class="settings-container">
    <div class="options">
      <unnnic-card
        v-for="page in pages"
        :key="page.href.name"
        type="account"
        :icon="$route.name === page.href.name ? page.icon[0] : page.icon[1]"
        :title="page.title"
        :description="page.description"
        :enabled="$route.name === page.href.name"
        @click.native="$router.push(page.href)"
      />
    </div>

    <div class="separator"></div>

    <external-system
      ref="system-project"
      :routes="['settingsProject']"
      class="page"
    />
  </div>
</template>

<script>
import ExternalSystem from '../components/ExternalSystem.vue';

export default {
  components: {
    ExternalSystem,
  },

  data() {
    return {};
  },

  computed: {
    pages() {
      return [
        {
          title: this.$t('settings.project.title'),
          description: this.$t('settings.project.description'),
          icon: ['cog-2', 'cog-1'],
          href: {
            name: 'settingsProject',
            params: { internal: ['init'] },
          },
        },
        /* {
          title: 'Módulo Chat',
          description: 'Altere e customize informações do módulo chat.',
          icon: ['messaging-we-chat-2', 'messaging-we-chat-3'],
          href: {
            name: 'settingsChat',
            params: { internal: ['init'] },
          },
        }, */
      ];
    },
  },

  watch: {
    '$route.fullPath': {
      immediate: true,

      handler() {
        this.$nextTick(() => {
          if (['settingsProject', 'settingsChat'].includes(this.$route.name)) {
            console.log('ó vai chamar', this.$route.name);
            this.initCurrentExternalSystem();
          }
        });
      },
    },

    '$route.name': {
      immediate: true,

      handler() {
        if (!['settingsProject', 'settingsChat'].includes(this.$route.name)) {
          this.$router.replace({
            name: 'settingsProject',
            params: {
              internal: ['init'],
            },
          });
        }
      },
    },

    '$route.params.projectUuid': {
      async handler() {
        const { projectUuid } = this.$route.params;

        if (!projectUuid) {
          return false;
        }

        this.$refs['system-project'].reset();
      },
    },
  },

  methods: {
    initCurrentExternalSystem() {
      const current = this.$route.name;

      if (current === 'settingsProject') {
        this.$refs['system-project'].init(this.$route.params);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.settings-container {
  padding: $unnnic-spacing-inset-md;

  display: flex;

  .options {
    width: 20.75rem;
    height: fit-content;
  }

  .separator {
    width: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: 0 $unnnic-spacing-inline-sm;
  }

  .page {
    flex: 1;
  }
}

.unnnic-card-account {
  user-select: none;
  cursor: pointer;

  & + .unnnic-card-account {
    margin-top: 0.625rem;
  }
}
</style>
