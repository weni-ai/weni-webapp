<template>
  <div class="project-format-control">
    <div class="label">
      <div>
        {{ $t('projects.create.format.label') }}
        <unnnic-tool-tip
          :text="$t('projects.create.format.info')"
          side="right"
          enabled
          class="info"
          max-width="20.5rem"
        >
          <unnnic-icon
            icon="alert-circle-1-1"
            scheme="neutral-cleanest"
            size="xs"
          />
        </unnnic-tool-tip>
      </div>

      <unnnic-button
        type="terciary"
        size="small"
        @click="
          $store.dispatch('openModal', {
            type: 'template-gallery',
            data: {},
            listeners: {
              change: ({ close, value }) => {
                close();
                $emit('change', value);
              },
            },
          })
        "
      >
        {{ $t('projects.create.format.see_all') }}
      </unnnic-button>
    </div>

    <div class="formats">
      <unnnic-card
        v-for="(format, index) in formats"
        :key="index"
        class="format"
        type="content"
        :title="format.title"
        :description="format.description"
        :enabled="type === format.value"
        :icon="format.icon"
        clickable
        @click.native="
          $emit('change', type === format.value ? null : format.value)
        "
      />

      <div
        :class="['blank', { enabled: type === 'blank' }]"
        @click="$emit('change', type === 'blank' ? null : 'blank')"
      >
        <unnnic-icon
          :scheme="type === 'blank' ? 'neutral-cloudy' : 'neutral-clean'"
          icon="add-1"
        />

        <div class="u font secondary body-md color-neutral-cloudy">
          {{ $t('projects.create.format.blank.title') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import projects from '../../api/projects';

export default {
  model: {
    prop: 'type',
    event: 'change',
  },

  props: {
    type: {
      type: String,
    },
  },

  data() {
    return {
      visibles: {},
      templates: [],
    };
  },

  async created() {
    if (this.$store.state.Project.templates.status === null) {
      this.$store.state.Project.templates.status = 'loading';

      const { data } = await projects.getTemplates();

      this.$store.state.Project.templates.status = 'loaded';
      this.$store.state.Project.templates.data = data.results;
    }
  },

  mounted() {},

  computed: {
    formats() {
      return [
        {
          title: this.$t('projects.create.format.lead_capture.title'),
          description: this.$t(
            'projects.create.format.lead_capture.description',
          ),
          icon: 'graph-stats-ascend-2',
          value: 'lead_capture',
        },
        {
          title: this.$t('projects.create.format.support.title'),
          description: this.$t('projects.create.format.support.description'),
          icon: 'headphones-customer-support-human-1-1',
          value: 'support',
        },
        {
          title: this.$t(
            'projects.create.format.omie-financial.title_simplified',
          ),
          description: this.$t(
            'projects.create.format.omie-financial.description',
          ),
          icon: 'copy-paste-1',
          value: 'omie-financial',
        },
        {
          title: this.$t(
            'projects.create.format.omie-financial+chatgpt.title_simplified',
          ),
          description: this.$t(
            'projects.create.format.omie-financial+chatgpt.description',
          ),
          icon: 'copy-paste-1',
          value: 'omie-financial+chatgpt',
        },
      ];
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.project-format-control {
  .label {
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-cloudy;
    margin-top: $unnnic-spacing-stack-md;
    margin-bottom: $unnnic-spacing-stack-xs;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .info {
      cursor: help;
    }
  }

  .formats {
    display: grid;
    gap: $unnnic-spacing-stack-sm $unnnic-spacing-inline-sm;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr auto;

    .unnnic-card-content {
      user-select: none;

      &:hover ::v-deep .unnnic-card-content__content__title {
        font-weight: $unnnic-font-weight-regular;
      }
      ::v-deep .unnnic-card-content__icon {
        background-color: rgba(59, 65, 77, 0.08);
      }
    }

    .blank {
      user-select: none;
      cursor: pointer;
      padding: $unnnic-squish-xs;
      grid-column-start: 1;
      grid-column-end: 3;
      outline-style: solid;
      outline-color: $unnnic-color-neutral-soft;
      outline-width: $unnnic-border-width-thinner;
      outline-offset: -$unnnic-border-width-thinner;
      border-radius: $unnnic-border-radius-sm;
      box-sizing: border-box;
      column-gap: $unnnic-spacing-stack-xs;
      display: flex;
      align-items: center;
      justify-content: center;

      &.enabled {
        background-color: rgba(
          $unnnic-color-brand-weni,
          $unnnic-opacity-level-light
        );
        outline-color: $unnnic-color-brand-weni;
      }
    }
  }
}
</style>
