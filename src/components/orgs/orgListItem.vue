<template>
    <div class="weni-org-list-item">
        <h1> Org </h1>
        <div class="weni-org-list-item__info">
            <p class="weni-org-list-item__info__description"> Some description </p>
            <button class="weni-org-list-item__info__button"> {{ $t('orgs.join') }} </button>
            <unnnic-dropdown>
                <unnnic-icon slot="trigger" icon="expand-full-1" class="weni-org-list-item__menu-icon" />
                <unnnic-dropdown-item>
                    <div class="weni-org-list-item__menu-item">
                        <unnnic-icon class="weni-org-list-item__dropdown-icon" size="sm" icon="button-refresh-arrows-1" />
                        {{ $t('orgs.change_name') }}
                    </div>
                </unnnic-dropdown-item>
                <unnnic-dropdown-item>
                    <div class="weni-org-list-item__menu-item">
                        <unnnic-icon class="weni-org-list-item__dropdown-icon" size="sm" icon="single-neutral-actions-1" />
                        {{ $t('orgs.manage_members') }}
                    </div>
                </unnnic-dropdown-item>
                <unnnic-dropdown-item>
                    <div class="weni-org-list-item__menu-item weni-danger">
                        <unnnic-icon class="weni-org-list-item__dropdown-icon" size="sm" icon="delete-1-1" />
                        {{ $t('orgs.delete') }}
                    </div>
                </unnnic-dropdown-item>
            </unnnic-dropdown>
        </div>
        <div class="weni-org-list-item__people">
            <div v-for="index in 4" :key="index" class="weni-org-list-item__people__item" />
        </div>
    </div>
</template>

<script>
import { unnnicIcon, unnnicDropdown, unnnicDropdownItem } from 'unnic-system-beta';
export default {
  name: 'OrgListItem',
  components: { unnnicIcon, unnnicDropdown, unnnicDropdownItem },
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
        
        h1 {
            font-size: $unnnic-font-size-title-md;
            margin: 0 0 $unnnic-spacing-stack-xs 0;
            font-weight: $unnnic-font-weight-bold;
        }

        &__people {
            display: flex;
            > * {
                margin-left: -0.5*$unnnic-avatar-size-nano;
            }

            :first-child {
                margin: 0;
            }

            &__item {
                background-color: red;
                border-radius: 50%;
                height: $unnnic-avatar-size-nano;
                width: $unnnic-avatar-size-nano;
                border: 2px solid $unnnic-color-neutral-black;
                color: $unnnic-color-neutral-darkest;
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
