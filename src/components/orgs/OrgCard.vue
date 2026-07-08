<template>
  <div
    class="org-card"
    :class="{ 'org-card--disabled': isAccessDisabled }"
    @click="onCardClick"
  >
    <div class="org-card__content">
      <div class="org-card__name-row">
        <h2 class="name">{{ name }}</h2>

        <UnnnicToolTip
          v-if="isAccessDisabled"
          :text="disabledTooltipText"
          enabled
          maxWidth="18.125rem"
          side="top"
        >
          <UnnnicIconSvg
            size="md"
            icon="info"
            scheme="feedback-red"
          />
        </UnnnicToolTip>
      </div>

      <p class="description">
        {{ description }}
      </p>

      <UnnnicTag
        class="plan-tag"
        :text="$t(`billing.payment.plans.${plan}.title`)"
        :scheme="planTagScheme"
      />
    </div>

    <div
      v-if="showOptionsMenu"
      class="org-card__options"
      @click.stop
    >
      <UnnnicDropdown
        :open="isOptionsOpen"
        class="unnnic-dropdown"
        @click.prevent
      >
        <template #trigger>
          <UnnnicIcon
            class="menu-icon"
            icon="navigation-menu-vertical-1"
            size="sm"
            :scheme="isOptionsOpen ? 'fg-base' : 'fg-muted'"
          />
        </template>

        <div
          v-if="!isAccessDisabled && role === ORG_ROLE_CONTRIBUTOR"
          class="option"
          @click="$emit('view')"
        >
          <UnnnicIcon
            icon="visibility"
            size="sm"
            scheme="neutral-dark"
          ></UnnnicIcon>

          {{ $t('orgs.view_members') }}
        </div>

        <div
          v-if="!isAccessDisabled && role === ORG_ROLE_ADMIN"
          class="option"
          @click="$emit('manage')"
        >
          <UnnnicIcon
            icon="person"
            size="sm"
            scheme="neutral-dark"
          ></UnnnicIcon>

          {{ $t('orgs.manage_members') }}
        </div>

        <div
          v-if="
            !isAccessDisabled &&
            [ORG_ROLE_FINANCIAL, ORG_ROLE_ADMIN].includes(role)
          "
          class="option"
          @click="$emit('billing')"
        >
          <UnnnicIcon
            icon="monetization_on"
            size="sm"
            scheme="neutral-dark"
          ></UnnnicIcon>

          {{ $t('orgs.billing') }}
        </div>

        <div
          v-if="!isAccessDisabled && role === ORG_ROLE_ADMIN"
          class="option"
          @click="$emit('edit')"
        >
          <UnnnicIcon
            icon="settings"
            size="sm"
            scheme="neutral-dark"
          ></UnnnicIcon>

          {{ $t('orgs.config') }}
        </div>

        <div
          v-if="role === ORG_ROLE_ADMIN"
          class="option danger"
          @click="$emit('open-delete-confirmation')"
        >
          <UnnnicIcon
            icon="logout"
            size="sm"
            scheme="fg-critical"
          ></UnnnicIcon>

          {{ $t('orgs.leave.title') }}
        </div>
      </UnnnicDropdown>
    </div>
  </div>
</template>

<script>
import {
  ORG_ROLE_CONTRIBUTOR,
  ORG_ROLE_ADMIN,
  ORG_ROLE_FINANCIAL,
} from './orgListItem.vue';
import {
  ACCESS_STATUS_ACTIVE,
  ACCESS_STATUS_DISABLED,
  getOrgAccessDisabledMessage,
} from '@/utils/orgAccess';

export default {
  props: {
    name: String,
    description: String,
    plan: String,
    role: Number,
    accessStatus: {
      type: String,
      default: ACCESS_STATUS_ACTIVE,
    },
    accessDisabledReason: {
      type: String,
      default: null,
    },
    ssoConfig: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      ORG_ROLE_CONTRIBUTOR,
      ORG_ROLE_ADMIN,
      ORG_ROLE_FINANCIAL,

      isOptionsOpen: false,
    };
  },

  computed: {
    isAccessDisabled() {
      return this.accessStatus === ACCESS_STATUS_DISABLED;
    },

    disabledTooltipText() {
      return getOrgAccessDisabledMessage(
        {
          access_disabled_reason: this.accessDisabledReason,
          sso_config: this.ssoConfig,
        },
        this.$t.bind(this),
      );
    },

    showOptionsMenu() {
      const rolesWithMenu = [
        ORG_ROLE_ADMIN,
        ORG_ROLE_CONTRIBUTOR,
        ORG_ROLE_FINANCIAL,
      ];

      if (!rolesWithMenu.includes(this.role)) {
        return false;
      }

      if (this.role === ORG_ROLE_ADMIN) {
        return true;
      }

      return !this.isAccessDisabled;
    },

    planTagScheme() {
      const schemesByPlan = {
        trial: 'blue',
        scale: 'orange',
        advanced: 'purple',
        enterprise: 'green',
        internal_weni: 'gray',
      };

      return schemesByPlan[this.plan] || 'gray';
    },
  },

  methods: {
    onCardClick() {
      if (this.isAccessDisabled) {
        return;
      }

      if (this.role === ORG_ROLE_FINANCIAL) {
        this.$emit('billing');
      } else {
        this.$emit('enter');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.org-card {
  cursor: pointer;
  display: flex;
  column-gap: $unnnic-spacing-sm;
  justify-content: space-between;

  outline-style: solid;
  outline-color: $unnnic-color-border-base;
  outline-width: 1px;
  outline-offset: -1px;

  background-color: $unnnic-color-bg-base;
  padding: $unnnic-spacing-md;
  border-radius: $unnnic-border-radius-md;

  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: $unnnic-shadow-1;
  }

  &--disabled {
    cursor: default;
    opacity: 0.7;

    &:hover {
      box-shadow: none;
    }

    .org-card__content {
      cursor: not-allowed;

      :deep(.unnnic-tooltip-trigger) {
        cursor: pointer;
      }
    }

    .name,
    .description {
      color: $unnnic-color-fg-muted;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__options {
    cursor: pointer;
    flex-shrink: 0;
  }

  &__name-row {
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-xs;
    margin-bottom: $unnnic-spacing-ant;
  }

  .name {
    color: $unnnic-color-fg-emphasized;

    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-title-md;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;

    margin: 0;
  }

  .description {
    color: $unnnic-color-fg-base;

    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

    margin: 0;

    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .plan-tag {
    user-select: none;
    margin-top: $unnnic-spacing-sm;
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

      color: $unnnic-color-fg-base;

      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

      padding: $unnnic-spacing-sm;

      white-space: nowrap;

      &.danger {
        color: $unnnic-color-fg-critical;
      }

      + .option {
        position: relative;

        &::before {
          pointer-events: none;
          display: block;
          content: ' ';
          background: $unnnic-color-border-muted;
          height: 1px;
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
