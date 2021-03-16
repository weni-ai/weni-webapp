<template>
  <div class="weni-project-list-item">
    <div class="weni-project-list-item__header">
      <p class="weni-project-list-item__header__title">
        <span class="weni-project-list-item__header__name"> {{ name }} </span>
        <unnnic-tool-tip :text="$t('projects.created_at_tooltip')" side="top" :enabled="true"> 
          <span class="weni-project-list-item__header__time"> <unnnic-icon size="xs" icon="time-clock-circle-1" /> {{ time }} </span>
        </unnnic-tool-tip>
      </p>
      <p>
        {{ $t('projects.created_by') }} <span class="weni-project-list-item--highlighted"> {{ owner }} </span>
      </p>
    </div>
    <div class="weni-project-list-item__separator" />
    <div class="weni-project-list-item__status__list">
      <div
        class="weni-project-list-item__status"
        v-for="(status, index) in statusList"
        :key="index">
        {{ status.title }}
        <p>
          <unnnic-icon
            size="xs"
            :scheme="status.scheme"
            has-background
            :icon="status.icon" /> 
          <span class="weni-project-list-item__status__number"> {{ status.count }} </span> </p>
      </div>
    </div>
  </div>
</template>

<script>
import { unnnicIcon, unnnicToolTip } from 'unnic-system-beta';
export default {
  name: 'ProjectItemList',
  components: { unnnicIcon, unnnicToolTip },
  props: {
    name: {
      type: String,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },
    owner: {
      type: String,
      default: null,
    },
    aiCount: {
      type: Number,
      default: 0,
    },
    contactCount: {
      type: Number,
      default: 0,
    },
    flowsCount: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    statusList() {
      return [
        { title: this.$t('projects.ai'), icon: 'science-fiction-robot-2', scheme: 'aux-blue', count: this.aiCount, },
        { title: this.$t('projects.flows'), icon: 'hierarchy-3-2', scheme: 'aux-purple', count: this.flowsCount, },
        { title: this.$t('projects.contacts'), icon: 'single-neutral-actions-1', scheme: 'aux-lemon', count: this.contactCount, },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
     @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
     .weni-project-list-item {
       padding: $unnnic-inset-sm;
       border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
       border-radius: $unnnic-border-radius-md;
       font-family: $unnnic-font-family-secondary;

      &__separator {
        margin: $unnnic-spacing-stack-sm 0;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-lightest;
      }

       p {
         margin: 0;
       }

       &--highlighted {
         color: $unnnic-color-brand-weni;
         font-weight: $unnnic-font-weight-bold;
       }

       &__header {
         color: $unnnic-color-neutral-cloudy;
         font-size: $unnnic-font-size-body-md;

         &__title {
           display: flex;
           justify-content: space-between;
         }

         &__time {
           text-align: right;
           flex: 1;
         }
         &__name {
           font-weight: $unnnic-font-weight-bold;
           color: $unnnic-color-neutral-darkest;
           font-size: $unnnic-font-size-body-lg;
         }
       }

       &__status {
         color: $unnnic-color-neutral-dark;
         font-size: $unnnic-font-size-body-gt;

         p {
           margin: $unnnic-spacing-stack-xs 0 0 0;
         }

         &__number {
           color: $unnnic-color-neutral-darkest;
           font-weight: $unnnic-font-weight-bold;
         }

         &__list {
           display: flex;
           justify-content: space-between;
         }
       }
     }
</style>