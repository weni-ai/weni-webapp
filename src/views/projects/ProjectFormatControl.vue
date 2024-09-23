<template>
  <div class="project-format-control">
    <div class="label">
      <div>
        {{ $t('projects.create.format.label') }}
        <UnnnicToolTip
          :text="$t('projects.create.format.info')"
          side="right"
          enabled
          class="info"
          maxWidth="20.5rem"
        >
          <UnnnicIcon
            icon="alert-circle-1-1"
            scheme="neutral-cleanest"
            size="xs"
          />
        </UnnnicToolTip>
      </div>

      <UnnnicButton
        type="tertiary"
        size="small"
        @click="
          $store.dispatch('openModal', {
            type: 'template-gallery',
            data: {},
            listeners: {
              change: ({ close, value }) => {
                close();
                $emit('change', value.value);
                $emit('update:setup', value.setup);
              },
            },
          })
        "
      >
        {{ $t('projects.create.format.see_all') }}
      </UnnnicButton>
    </div>

    <div class="formats">
      <UnnnicCard
        v-for="(format, index) in formats"
        :key="index"
        class="format"
        type="content"
        :title="format.title"
        :description="format.description"
        :enabled="type === format.value"
        :icon="format.icon"
        clickable
        @click="selectFormat(format.value)"
      />

      <div
        :class="['blank', { enabled: type === 'blank' }]"
        @click="$emit('change', type === 'blank' ? null : 'blank')"
      >
        <UnnnicIcon
          :scheme="type === 'blank' ? 'neutral-cleanest' : 'neutral-clean'"
          icon="add"
          size="xl"
        />

        <div class="u font secondary body-md color-neutral-cloudy">
          {{ $t('projects.create.format.blank.title') }}
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="error u font secondary body-md color-feedback-red"
    >
      {{ error }}
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

    setup: {
      type: Object,
      default() {
        return {};
      },
    },

    error: {
      type: [Boolean, String],
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
          title: this.$t('projects.create.format.sac+chatgpt.title'),
          description: this.$t(
            'projects.create.format.sac+chatgpt.description',
          ),
          icon: 'messages-bubble-1',
          value: '02bcc936-bed5-4bed-b31c-53f841141d4d',
        },
        {
          title: this.$t('projects.create.format.support.title'),
          description: this.$t('projects.create.format.support.description'),
          icon: 'headphones-customer-support-human-1-1',
          value: 'fbbc0357-496d-458c-b89c-6d19057594b3',
        },
        {
          title: this.$t('projects.create.format.lead_capture.title'),
          description: this.$t(
            'projects.create.format.lead_capture.description',
          ),
          icon: 'graph-stats-ascend-2',
          value: '9e75fb07-12d2-49e7-a989-1ab631425c6c',
        },
      ];
    },
  },

  methods: {
    selectFormat(template) {
      if (this.type === template) {
        this.$emit('change', null);
      } else {
        const selectedTemplate = this.$store.state.Project.templates.data.find(
          ({ uuid }) => uuid === template,
        );

        if (selectedTemplate?.setup?.fields) {
          this.$store.dispatch('openModal', {
            type: 'template-gallery',
            data: {
              selectedTemplate,
              step: 'setup',
            },
            listeners: {
              change: ({ close, value }) => {
                close();
                this.$emit('change', value.value);
                this.$emit('update:setup', value.setup);
              },
            },
          });
        } else {
          this.$emit('change', template);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
    grid-template-rows: 1fr 1fr;

    .unnnic-card-content {
      user-select: none;

      &:hover :deep(.unnnic-card-content__content__title) {
        font-weight: $unnnic-font-weight-regular;
      }
      :deep(.unnnic-card-content__icon) {
        background-color: rgba(59, 65, 77, 0.08);
      }
    }

    .blank {
      user-select: none;
      cursor: pointer;
      padding: $unnnic-squish-xs;
      outline-style: solid;
      outline-color: $unnnic-color-neutral-soft;
      outline-width: $unnnic-border-width-thinner;
      outline-offset: -$unnnic-border-width-thinner;
      border-radius: $unnnic-border-radius-sm;
      box-sizing: border-box;
      row-gap: $unnnic-spacing-stack-xs;
      display: flex;
      flex-direction: column;
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

  .error {
    margin-top: $unnnic-spacing-stack-nano;
  }
}
</style>
