<template>
  <div class="weni-org-role">
    <avatar :imageUrl="imageUrl" size="sm" />
    <div class="weni-org-role__info">
      <p class="weni-org-role__info__name"> {{ name }} </p>
      <p class="weni-org-role__info__email"> {{ email }} </p>
    </div>
    <div
      v-if="!disabled"
      class="weni-org-role__role">
      <unnnic-dropdown>
        <unnnic-button
          class="weni-org-role__action__button"
          slot="trigger"
          type="terciary"
          size="sm"
          icon-right="arrow-down-1-1">
           {{ labelFor(role) }}
        </unnnic-button>
      <unnnic-dropdown-item
        v-for="roleOption in roleOptions"
        :key="roleOption"
        @click="onSelectRole(roleOption)">
        {{ labelFor(roleOption) }}
      </unnnic-dropdown-item>
      </unnnic-dropdown>
        <unnnic-icon
          class="weni-org-role__action"
          size="sm"
          icon="delete-1-1"
          clickable
          @click="onDelete()"/>
    </div>
    <unnnic-button
      v-else
      disabled
      size="sm"
      icon-right="arrow-down-1-1"> {{ labelFor(role) }} </unnnic-button>
  </div> 
</template>

<script>
import Avatar from '../Avatar';
import { unnnicDropdown, unnnicDropdownItem, unnnicButton, unnnicIcon } from 'unnic-system-beta';
export default {
  components: { Avatar, unnnicDropdown, unnnicDropdownItem, unnnicButton, unnnicIcon },
  props: {
    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    role: {
      type: String,
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
  },
  data() {
    return {
      roles: {
        1: 'view',
        2: 'contributor',
        3: 'admin',
      },
    };
  },
  computed: {
    roleOptions() {
      return Object.keys(this.roles);
    },
  },
  methods: {
    labelFor(role) {
      return this.$t(`orgs.roles.${this.roles[role]}`)
    },
    onSelectRole(role) {
      console.log(role);
      this.$emit('onChangeRole', role);
    },
    onDelete() {
      this.$emit('onDelete');
    }
  },
}
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnnic.scss';

    .weni-org-role {
        display: flex;
        align-items: center;
        font-family: $unnnic-font-family-secondary;

        &__role {
            display: flex;
            align-items: center;
        }

        &__action {
            color: $unnnic-color-neutral-clean;

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
            }

            > * {
              margin: 0;
            }
        }
    }

</style>

