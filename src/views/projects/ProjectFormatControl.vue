<template>
  <div class="project-format-control">
    <div class="label">
      {{ $t('projects.create.format.label') }}

      <unnnic-tool-tip
        :text="$t('projects.create.format.info')"
        side="right"
        enabled
        class="info"
      >
        <unnnic-icon
          icon="alert-circle-1-1"
          scheme="neutral-cleanest"
          size="xs"
        />
      </unnnic-tool-tip>
    </div>

    <div class="formats">
      <unnnic-card
        v-for="format in formats"
        :key="format.value"
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
    </div>
  </div>
</template>

<script>
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
    return {};
  },

  computed: {
    formats() {
      return [
        {
          title: this.$t('projects.create.format.blank.title'),
          description: this.$t('projects.create.format.blank.description'),
          icon: 'view-1-1',
          value: 'blank',
        },
        {
          title: this.$t('projects.create.format.ready_made.title'),
          description: this.$t('projects.create.format.ready_made.description'),
          icon: 'view-1-1',
          value: 'ready-made',
        }
      ];
    },
  },
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

    .info {
      cursor: help;
    }
  }

  .formats {
    display: flex;
    column-gap: $unnnic-spacing-inline-sm;

    .unnnic-card-content {
      user-select: none;
      flex: 1;

      &:hover ::v-deep .unnnic-card-content__content__title {
        font-weight: $unnnic-font-weight-regular;
      }
    }
  }
}
</style>
