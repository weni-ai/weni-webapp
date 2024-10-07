<template>
  <div class="weni-org-role">
    <div>
      <Avatar
        :imageUrl="imageUrl"
        size="sm"
      />
      <div class="weni-org-role__info">
        <p class="weni-org-role__info__name">{{ name }}</p>
        <p class="weni-org-role__info__email">{{ email }}</p>
      </div>
    </div>
    <div class="weni-org-role__role">
      <UnnnicTag
        v-if="status"
        :text="status"
        scheme="feedback-yellow"
        class="status"
      />

      <UnnnicButton
        v-if="disabled"
        type="tertiary"
        disabled
        size="small"
      >
        {{ $t(`orgs.roles.${this.roles[role].title}`) }}
      </UnnnicButton>

      <OrgUserRoleSelect
        v-else
        type="button"
        :modelValue="currentRole"
        @update:model-value="onSelectRole($event)"
      />

      <UnnnicToolTip
        v-if="canDelete"
        side="left"
        enabled
        :text="deleteTooltip"
        class="delete-button"
      >
        <UnnnicIconSvg
          scheme="neutral-clean"
          size="sm"
          icon="cancel"
          clickable
          @click="onDelete()"
        />
      </UnnnicToolTip>
    </div>
  </div>
</template>

<script>
import Avatar from '../Avatar.vue';
import OrgUserRoleSelect from './OrgUserRoleSelect.vue';

export default {
  components: {
    Avatar,
    OrgUserRoleSelect,
  },
  props: {
    username: {
      type: String,
    },

    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    role: {
      type: null,
      default: '',
    },
    imageUrl: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: null,
    },

    canDelete: {
      type: Boolean,
      default: false,
    },

    deleteTooltip: {
      type: String,
    },

    status: {
      type: String,
    },
  },
  data() {
    return {
      roles: {
        3: { title: 'admin', position: 1 },
        4: { title: 'financial', position: 2 },
        2: { title: 'contributor', position: 3 },
      },
      currentRole: this.role,
    };
  },
  computed: {},

  methods: {
    onSelectRole(value) {
      this.currentRole = value;
      this.$emit('onChangeRole', value);
    },
    onDelete() {
      this.$emit('onDelete', this.username);
    },
  },
};
</script>

<style lang="scss" scoped>
.weni-org-role {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: $unnnic-font-family-secondary;

  > div {
    display: flex;

    :deep(.weni-avatar) {
      min-width: 2.5rem;
      margin-right: $unnnic-spacing-stack-xs;
    }

    > .weni-org-role__info {
      margin-left: 0;
      margin-right: $unnnic-spacing-stack-xs;
      max-width: 230px;

      p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .status {
    margin-right: $unnnic-spacing-inline-sm;
  }

  &__role {
    display: flex;
    align-items: center;
  }

  &__action {
    &__button {
      color: $unnnic-color-neutral-dark;
    }
  }

  &__info {
    margin: 0 $unnnic-inline-xs;
    flex: 1;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;

    &__name {
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-darkest;
    }

    &__email {
      color: $unnnic-color-neutral-cloudy;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    > * {
      margin: 0;
    }
  }

  .delete-button {
    margin-left: $unnnic-spacing-inline-xs;
  }
}

.unnnic-dropdown {
  :deep(.unnnic-dropdown__content) {
    min-width: calc(276px - 32px);

    a > span {
      width: 100%;
      display: block;
      font-weight: $unnnic-font-weight-light;
    }

    h4 {
      font-weight: $unnnic-font-weight-regular;
    }

    h4,
    a > span {
      margin: 0;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      font-size: $unnnic-font-size-body-md;
      color: $unnnic-color-neutral-dark;
    }
  }
}
</style>
