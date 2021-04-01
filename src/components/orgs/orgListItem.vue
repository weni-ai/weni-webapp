<template>
  <div :class="{'weni-org-list-item': true, 'weni-org-list-item--highlighted': highlighted}">
    <h1> {{ name }} </h1>
    <div class="weni-org-list-item__info">
    <p class="weni-org-list-item__info__description"> {{ description }} </p>
    <button
      class="weni-org-list-item__info__button unnnic--clickable"
      @click="onSelectOrg()">
        {{ $t('orgs.join') }}
    </button>
    <unnnic-dropdown :open.sync="highlighted">
      <unnnic-icon
        slot="trigger"
        icon="navigation-menu-vertical-1"
        size="sm"
        class="weni-org-list-item__menu-icon" />
        <template v-if="canEdit">
          <unnnic-dropdown-item @click="onEdit()">
            <div class="weni-org-list-item__menu-item">
              <unnnic-icon
                class="weni-org-list-item__dropdown-icon"
                size="sm"
                icon="button-refresh-arrows-1"
              />
              {{ $t('orgs.change_name') }}
            </div>
          </unnnic-dropdown-item>

          <unnnic-dropdown-item @click="onManage()">
            <div class="weni-org-list-item__menu-item">
              <unnnic-icon
                class="weni-org-list-item__dropdown-icon"
                size="sm"
                icon="single-neutral-actions-1"
              />
              {{ $t('orgs.manage_members') }}
            </div>
          </unnnic-dropdown-item>

          <unnnic-dropdown-item @click="deleteModalOpen=true">
            <div class="weni-org-list-item__menu-item weni-danger">
              <unnnic-icon
                class="weni-org-list-item__dropdown-icon"
                size="sm"
                icon="delete-1-1"
              />
              {{ $t('orgs.delete') }}
            </div>
          </unnnic-dropdown-item>
        </template>

        <unnnic-dropdown-item v-else @click="onView()">
          <div class="weni-org-list-item__menu-item">
            <unnnic-icon
              class="weni-org-list-item__dropdown-icon"
              size="sm"
              icon="view-1-1"
            />
            {{ $t('orgs.view_members') }}
          </div>
        </unnnic-dropdown-item>
    </unnnic-dropdown>
  </div>
  <div class="weni-org-list-item__people__wrapper">
    <div class="weni-org-list-item__people">
      <unnnic-tool-tip
        :text="getName(user)"
        side="top"
        :enabled="true"
        v-for="user in displayMembers"
        :key="user.username"
      >
        <avatar
          class="weni-org-list-item__people__item"
          :image-url="user.photo_user"
          size="nano"
        />
      </unnnic-tool-tip>
    </div>
    <span v-if="remainingMembers > 0"> {{ $tc('orgs.remaining_members', remainingMembers) }} </span>
  </div>
  <unnnic-modal
    :text="$t('orgs.delete')"
    icon="alert-circle-1"
    scheme="feedback-red"
    :show-modal="deleteModalOpen">
    <span slot="message">{{ $t('orgs.delete_confirm', { org: name }) }}</span>
    <unnnic-button
      type="terciary"
      slot="options"
      @click="deleteModalOpen=false">
        {{ $t('account.cancel') }}
    </unnnic-button>
    <unnnic-button
      type="terciary"
      slot="options"
      @click="onDeleteOrg()">
        {{ $t('orgs.delete') }}
    </unnnic-button>
  </unnnic-modal>
</div>
</template>

<script>
import { unnnicIcon, unnnicDropdown, unnnicDropdownItem, unnnicModal } from '@weni/unnnic-system';
import Avatar from '../Avatar';
export default {
  name: 'OrgListItem',
  props: {
    name: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    members: {
      type: Array,
      default: () => [],
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
   },
  components: {
    unnnicIcon,
    unnnicDropdown,
    unnnicDropdownItem,
    unnnicModal,
    Avatar,
  },
  data() {
    return {
      deleteModalOpen: false,
      highlighted: false,
    };
  },
  computed: {
    displayMembers() {
      if (!this.members) return [];
      return this.members.slice(0, 4);
    },
    remainingMembers() {
      if (!this.members) return 0;
      return this.members.length - 4;
    },
  },
  methods: {
    getName(user) {
      const name = [user.first_name, user.last_name].filter(name => name).join(' ');
      return name ? name : user.username;
    },
    
    onSelectOrg() {
      this.$emit('select');
    },
    onDeleteOrg() {
      this.$emit('delete');
      this.deleteModalOpen = false;
    },
    onEdit() {
      this.$emit('edit');
    },
    onManage() {
      this.$emit('manage');
    },
    onView() {
      this.$emit('view');
    },
  },
};
</script>

<style lang="scss" scoped>
    @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

    .weni-danger {
        color: $unnnic-color-feedback-red !important;
    }

    .weni-org-list-item {
        padding: $unnnic-inset-md;
        box-sizing: border-box;
        background-color: $unnnic-color-background-sky;
        border-radius: $unnnic-border-radius-md;
        border: 2px solid transparent;

        &--highlighted {
            border: 2px solid $unnnic-color-neutral-soft;
        }
        
        h1 {
            font-size: $unnnic-font-size-title-md;
            margin: 0 0 $unnnic-spacing-stack-nano 0;
            font-weight: $unnnic-font-weight-bold;
            line-height: $unnnic-font-size-title-md + $unnnic-line-height-medium;
        }

        &__people {
            display: inline-flex;
            margin: 0 $unnnic-inline-nano 0 0;

            &__wrapper {
              font-size: $unnnic-font-size-body-md;
            }
            
            > * {
                margin: 0 0 0 -0.5*$unnnic-avatar-size-nano;
            }

            :first-child {
                margin: 0;
            }

            &__item {
              border: 2px solid $unnnic-color-neutral-black;
            }
        }

        &__info {
            display: flex;
            align-items: center;
            margin-bottom: $unnnic-spacing-stack-md;
            
            &__button {
                outline: none;
                border: none;
                padding: $unnnic-squish-nano;
                border-radius: $unnnic-border-radius-pill;
                box-sizing: border-box;
                background-color: rgba(0, 222, 210, 0.16);
                margin-right: $unnnic-inline-ant;
                color: $unnnic-color-neutral-darkest;
            }

            &__description {
                flex: 1;
                margin: 0 $unnnic-inline-sm 0 0;
                font-size: $unnnic-font-size-body-gt;
                color: $unnnic-color-neutral-dark;
            }
        }

        &__menu-item {
            display: flex;
            align-items: center;
            overflow: hidden;
            white-space: nowrap;
        }

        &__menu-icon {
            color: $unnnic-color-neutral-cleanest;
        }

        &__dropdown-icon {
            margin-right: $unnnic-inline-xs;
        }
    }
</style>
