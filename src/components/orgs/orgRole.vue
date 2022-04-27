<template>
  <div class="weni-org-role">
    <div>
      <avatar :imageUrl="imageUrl" size="sm" />
      <div class="weni-org-role__info">
        <p class="weni-org-role__info__name">{{ name }}</p>
        <p class="weni-org-role__info__email">{{ email }}</p>
      </div>
    </div>
    <div class="weni-org-role__role">
      <unnnic-tag
        v-if="status"
        :text="status"
        scheme="feedback-yellow"
        class="status"
      />

      <unnnic-button v-if="disabled" type="terciary" disabled size="small">
        {{ labelFor(currentRole) }}
      </unnnic-button>

      <unnnic-dropdown v-else>
        <unnnic-button
          class="weni-org-role__action__button"
          size="small"
          slot="trigger"
          type="terciary"
          icon-right="arrow-down-1-1"
        >
          {{ labelFor(currentRole) }}
        </unnnic-button>

        <unnnic-dropdown-item
          v-for="roleOption in roleOptions"
          :key="roleOption"
          @click="onSelectRole(roleOption)"
        >
          <h4>{{ labelFor(roleOption) }}</h4>
          <span>
            {{ descriptionFor(roleOption) }}
          </span>
        </unnnic-dropdown-item>
      </unnnic-dropdown>

      <unnnic-tool-tip
        v-if="canDelete"
        side="left"
        enabled
        :text="deleteTooltip"
        class="delete-button"
      >
        <unnnic-icon-svg
          scheme="neutral-clean"
          size="sm"
          icon="delete-1-1"
          clickable
          @click="onDelete()"
        />
      </unnnic-tool-tip>
    </div>
  </div>
</template>

<script>
import Avatar from '../Avatar';
export default {
  components: {
    Avatar,
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
        2: { title: 'contributor', position: 3 },
        3: { title: 'admin', position: 1 },
        4: { title: 'financial', position: 2 },
        // 2: 'contributor',
        // 3: 'admin',
        // 4: 'financial',
      },
      currentRole: this.role,
    };
  },
  computed: {
    roleOptions() {
      const entries = Object.entries(this.roles);
      const orderedArray = entries
        .sort((pos1, pos2) => {
          return pos1[1].position - pos2[1].position;
        })
        .map((item) => {
          return item[0];
        });
      return orderedArray;
    },
  },
  methods: {
    labelFor(role) {
      return this.$t(`orgs.roles.${this.roles[role].title}`);
    },
    descriptionFor(role) {
      return this.$t(`orgs.roles.${this.roles[role].title}_description`);
    },
    onSelectRole(role) {
      this.currentRole = role;
      this.$emit('onChangeRole', role);
    },
    onDelete() {
      this.$emit('onDelete', this.username);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-org-role {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: $unnnic-font-family-secondary;

  > div {
    display: flex;

    ::v-deep .weni-avatar {
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
  ::v-deep .unnnic-dropdown__content {
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
