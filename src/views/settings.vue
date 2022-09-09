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

    <external-system
      ref="system-chats-settings"
      :routes="['settingsChats']"
      class="page"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ExternalSystem from '../components/ExternalSystem.vue';

export default {
  components: {
    ExternalSystem,
  },

  data() {
    return {};
  },

  computed: {
    ...mapGetters(['currentProject']),

    pages() {
      const options = [
        {
          title: this.$t('settings.project.title'),
          description: this.$t('settings.project.description'),
          icon: ['cog-2', 'cog-1'],
          href: {
            name: 'settingsProject',
            params: { internal: ['init'] },
          },
        },
      ];

      if (this.currentProject?.menu?.chats) {
        options.push({
          title: this.$t('settings.chats.title'),
          description: this.$t('settings.chats.description'),
          icon: ['messaging-we-chat-2', 'messaging-we-chat-3'],
          href: {
            name: 'settingsChats',
            params: { internal: ['init'] },
          },
        });
      }

      return options;
    },
  },

  watch: {
    '$route.fullPath': {
      immediate: true,

      handler() {
        this.$nextTick(() => {
          if (['settingsProject', 'settingsChats'].includes(this.$route.name)) {
            this.initCurrentExternalSystem();
          }
        });
      },
    },

    '$route.name': {
      immediate: true,

      handler() {
        if (!['settingsProject', 'settingsChats'].includes(this.$route.name)) {
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
        this.$refs['system-chats-settings'].reset();
      },
    },
  },

  methods: {
    initCurrentExternalSystem() {
      const current = this.$route.name;

      if (current === 'settingsProject') {
        this.$refs['system-project'].init(this.$route.params);
      } else if (current === 'settingsChats') {
        this.$refs['system-chats-settings'].init(this.$route.params);
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
