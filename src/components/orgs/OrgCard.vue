<template>
  <div
    class="org-card"
    @click="role === ORG_ROLE_FINANCIAL ? $emit('billing') : $emit('enter')"
  >
    <div>
      <h2 class="name">{{ name }}</h2>

      <p class="description">
        {{ description }}
      </p>

      <div :class="['tag', plan]">
        {{ $t(`billing.payment.plans.${plan}.title`) }}
      </div>
    </div>

    <div>
      <unnnic-dropdown @click.prevent class="unnnic-dropdown">
        <unnnic-icon
          slot="trigger"
          class="menu-icon"
          icon="navigation-menu-vertical-1"
          size="sm"
          scheme="neutral-clean"
        ></unnnic-icon>

        <div
          class="option"
          v-if="role === ORG_ROLE_CONTRIBUTOR"
          @click="$emit('view')"
        >
          <unnnic-icon
            icon="visibility"
            size="sm"
            scheme="neutral-dark"
          ></unnnic-icon>

          {{ $t('orgs.view_members') }}
        </div>

        <div
          class="option"
          v-if="role === ORG_ROLE_ADMIN"
          @click="$emit('manage')"
        >
          <unnnic-icon
            icon="person"
            size="sm"
            scheme="neutral-dark"
          ></unnnic-icon>

          {{ $t('orgs.manage_members') }}
        </div>

        <div
          class="option"
          v-if="[ORG_ROLE_FINANCIAL, ORG_ROLE_ADMIN].includes(role)"
          @click="$emit('billing')"
        >
          <unnnic-icon
            icon="monetization_on"
            size="sm"
            scheme="neutral-dark"
          ></unnnic-icon>

          {{ $t('orgs.billing') }}
        </div>

        <div
          class="option"
          v-if="role === ORG_ROLE_ADMIN"
          @click="$emit('edit')"
        >
          <unnnic-icon
            icon="settings"
            size="sm"
            scheme="neutral-dark"
          ></unnnic-icon>

          {{ $t('orgs.config') }}
        </div>

        <div
          class="option danger"
          v-if="role === ORG_ROLE_ADMIN"
          @click="$emit('open-delete-confirmation')"
        >
          <unnnic-icon
            icon="logout"
            size="sm"
            scheme="aux-red-500"
          ></unnnic-icon>

          {{ $t('orgs.leave.title') }}
        </div>
      </unnnic-dropdown>
    </div>
  </div>
</template>

<script>
import {
  ORG_ROLE_CONTRIBUTOR,
  ORG_ROLE_ADMIN,
  ORG_ROLE_FINANCIAL,
} from './orgListItem.vue';

export default {
  props: {
    name: String,
    description: String,
    plan: String,
    role: Number,
  },

  data() {
    return {
      ORG_ROLE_CONTRIBUTOR,
      ORG_ROLE_ADMIN,
      ORG_ROLE_FINANCIAL,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.org-card {
  cursor: pointer;
  display: flex;
  column-gap: $unnnic-spacing-sm;
  justify-content: space-between;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-cleanest;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  background-color: $unnnic-color-background-white;
  padding: $unnnic-spacing-md;
  border-radius: $unnnic-border-radius-md;

  &:hover {
    outline-width: $unnnic-border-width-thin;
    outline-offset: -$unnnic-border-width-thin;
  }

  .name {
    color: $unnnic-color-neutral-black;

    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-title-md;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;

    margin: 0;
    margin-bottom: $unnnic-spacing-ant;
  }

  .description {
    color: $unnnic-color-neutral-dark;

    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

    margin: 0;
  }

  .tag {
    display: inline-block;
    user-select: none;

    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    margin-top: $unnnic-spacing-sm;
    padding: $unnnic-spacing-nano $unnnic-spacing-ant;
    border-radius: $unnnic-border-radius-pill;

    $plan-colors: 'trial' $unnnic-color-aux-blue-500,
      'advanced' $unnnic-color-aux-purple-500,
      'enterprise' $unnnic-color-aux-green-500;

    @each $name, $color in $plan-colors {
      &.#{$name} {
        color: $color;
        background-color: rgba($color, $unnnic-opacity-level-extra-light);
      }
    }
  }

  .menu-icon {
    display: block;
    margin-block: $unnnic-spacing-xs;
    user-select: none;
  }

  .unnnic-dropdown {
    :deep(.unnnic-dropdown__trigger .unnnic-dropdown__content) {
      margin-top: 0;
      padding: 0;
    }

    .option {
      user-select: none;
      display: flex;
      column-gap: $unnnic-spacing-xs;
      align-items: center;

      color: $unnnic-color-neutral-dark;

      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

      padding: $unnnic-spacing-sm;

      white-space: nowrap;

      &.danger {
        color: $unnnic-color-aux-red-500;
      }

      + .option {
        position: relative;

        &::before {
          pointer-events: none;
          display: block;
          content: ' ';
          background: $unnnic-color-neutral-light;
          height: $unnnic-border-width-thinner;
          position: absolute;
          top: 0;
          left: $unnnic-spacing-sm;
          right: $unnnic-spacing-sm;
        }
      }
    }
  }
}
</style>
