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
        <unnnic-dropdown-item>
          <div class="weni-org-list-item__menu-item">
            <unnnic-icon
              class="weni-org-list-item__dropdown-icon"
              size="sm"
              icon="button-refresh-arrows-1" />
            {{ $t('orgs.change_name') }}
          </div>
        </unnnic-dropdown-item>
        <unnnic-dropdown-item>
          <div class="weni-org-list-item__menu-item">
            <unnnic-icon
              class="weni-org-list-item__dropdown-icon"
              size="sm"
              icon="single-neutral-actions-1" />
              {{ $t('orgs.manage_members') }}
          </div>
        </unnnic-dropdown-item>
        <unnnic-dropdown-item @click="deleteModalOpen=true">
          <div class="weni-org-list-item__menu-item weni-danger">
            <unnnic-icon
              class="weni-org-list-item__dropdown-icon"
              size="sm"
              icon="delete-1-1" />
            {{ $t('orgs.delete') }}
          </div>
        </unnnic-dropdown-item>
    </unnnic-dropdown>
  </div>
  <div class="weni-org-list-item__people">
    <avatar
      size="nano"
      v-for="index in 4"
      :key="index"
      class="weni-org-list-item__people__item" />
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
import { unnnicIcon, unnnicDropdown, unnnicDropdownItem, unnnicModal } from 'unnic-system-beta';
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
    }
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
  methods: {
    onSelectOrg() {
      this.$emit('select');
    },
    onDeleteOrg() {
      this.$emit('delete');
      this.deleteModalOpen = false;
    }
  },
};
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnnic.scss';

    .weni-danger {
        color: $unnnic-color-feedback-red !important;
    }

    .weni-org-list-item {
        padding: $unnnic-inset-md;
        box-sizing: border-box;
        background-color: $unnnic-color-background-sky;
        border-radius: $unnnic-border-radius-md;

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
            display: flex;
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
        }

        &__menu-icon {
            color: $unnnic-color-neutral-cleanest;
        }

        &__dropdown-icon {
            margin-right: $unnnic-inline-xs;
        }
    }
</style>
