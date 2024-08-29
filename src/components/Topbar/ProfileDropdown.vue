<template>
  <UnnnicDropdown
    position="bottom-left"
    class="dropdown"
    :open.sync="isProfileDropdownOpen"
  >
    <section
      slot="trigger"
      class="profile"
      :class="{ 'profile--selected': isProfileDropdownOpen }"
      data-test="dropdown-trigger"
    >
      <ProfilePictureDefault
        v-if="photoWithError || !photo"
        :text="initialLetters"
        class="profile__picture"
      />

      <img
        v-else
        :src="photo"
        class="profile__picture"
        @error="photoWithError = true"
        data-test="profile-image"
      />

      <p class="profile__name">{{ firstName }}</p>

      <UnnnicIcon
        class="profile__right-icon"
        :class="{ 'profile__right-icon--rotate-180deg': isProfileDropdownOpen }"
        icon="keyboard_arrow_down"
        size="md"
        scheme="inherit"
      />
    </section>

    <section class="dropdown__content">
      <template v-for="(action, index) in actions">
        <RouterLink
          v-if="action.viewUrl"
          :to="action.viewUrl"
          :key="`link-${index}`"
          class="action"
          :class="[action.scheme && `action--scheme-${action.scheme}`]"
          :data-test="action.testId"
        >
          <UnnnicIcon
            :icon="action.icon"
            scheme="inherit"
            class="action__icon"
          />

          {{ action.label }}
        </RouterLink>

        <section
          v-else
          :key="`${index}`"
          class="action"
          :class="[action.scheme && `action--scheme-${action.scheme}`]"
          @click="action.onClick"
          :data-test="action.testId"
        >
          <UnnnicIcon
            :icon="action.icon"
            size="sm"
            scheme="inherit"
            class="action__icon"
          />

          {{ action.label }}
        </section>
      </template>

      <hr />

      <ProfileLanguageSelector />
    </section>
  </UnnnicDropdown>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue';

import ProfilePictureDefault from './ProfilePictureDefault.vue';
import ProfileLanguageSelector from './ProfileLanguageSelector.vue';
import i18n from '@/utils/plugins/i18n.js';

import {
  ORG_ROLE_ADMIN,
  ORG_ROLE_FINANCIAL,
} from '@/components/orgs/orgListItem.vue';

const instance = getCurrentInstance();

function use(name) {
  const { proxy } = instance;
  const module = proxy[`$${name}`];
  return module;
}

const store = use('store');
const keycloak = use('keycloak');

const photoWithError = ref(false);
const isProfileDropdownOpen = ref(false);

const firstName = computed(() => {
  return getProfileProperty('first_name');
});

const initialLetters = computed(() => {
  return [getProfileProperty('first_name'), getProfileProperty('last_name')]
    .map((name) => String(name).trim().slice(0, 1))
    .join('')
    .toUpperCase();
});

const photo = computed(() => {
  return getProfileProperty('photo');
});

function getProfileProperty(property) {
  return store.state.Account.profile?.[property];
}

const actions = computed(() => {
  const actions = [];

  actions.push(
    ...[
      {
        icon: 'person',
        label: i18n.t('NAVBAR.ACCOUNT'),
        viewUrl: '/account/edit',
        testId: 'account',
      },
      {
        icon: 'swap_horiz',
        label: i18n.t('NAVBAR.CHANGE_ORG'),
        viewUrl: '/orgs',
        testId: 'see-all-orgs',
      },
    ],
  );

  const routeParams = instance.proxy['$route'].params;

  if (
    (routeParams.orgUuid || routeParams.projectUuid) &&
    [ORG_ROLE_ADMIN, ORG_ROLE_FINANCIAL].includes(
      store.getters.org?.authorization.role,
    )
  ) {
    actions.push(
      ...[
        {
          icon: 'paid',
          label: i18n.t('NAVBAR.YOUR_PLAN'),
          viewUrl: `/orgs/${store.getters.org?.uuid}/billing`,
          testId: 'billing',
        },
      ],
    );
  }

  actions.push(
    ...[
      {
        icon: 'logout',
        scheme: 'error',
        label: i18n.t('NAVBAR.LOGOUT'),
        onClick: showLogoutModal,
        testId: 'logout',
      },
    ],
  );

  return actions;
});

function showLogoutModal() {
  store.dispatch('openModal', {
    type: 'confirm',
    data: {
      icon: 'logout',
      scheme: 'feedback-red',
      title: i18n.t('NAVBAR.LOGOUT'),
      description: i18n.t('NAVBAR.LOGOUT_MESSAGE'),
      cancelText: i18n.t('NAVBAR.CANCEL'),
      confirmText: i18n.t('NAVBAR.LOGOUT'),
      onConfirm: (justClose) => {
        justClose();
        keycloak.logout();
      },
    },
  });
}
</script>

<style lang="scss" scoped>
.profile {
  cursor: pointer;
  user-select: none;
  display: flex;
  column-gap: $unnnic-spacing-xs;
  align-items: center;

  &__picture {
    width: $unnnic-avatar-size-sm;
    height: $unnnic-avatar-size-sm;
    border-radius: $unnnic-border-radius-sm;
    object-fit: cover;
  }

  &__name,
  &__right-icon {
    color: $unnnic-color-neutral-dark;
  }

  &__name {
    margin: 0;
    min-width: 5.125 * $unnnic-font-size;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__right-icon {
    transition: transform 200ms;

    &--rotate-180deg {
      transform: rotate(180deg);
    }
  }

  &:hover,
  &--selected {
    .profile__name,
    .profile__right-icon {
      color: $unnnic-color-neutral-darkest;
    }
  }
}

.dropdown {
  :deep(.unnnic-dropdown__trigger) {
    display: block;
  }

  :deep(.unnnic-dropdown__content) {
    margin-top: $unnnic-spacing-nano;

    padding: $unnnic-spacing-xs;
    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-neutral-white;
    box-shadow: $unnnic-shadow-level-near;
    width: 17.5 * $unnnic-font-size;
    box-sizing: border-box;
  }

  &__content {
    hr {
      border-width: 0;
      border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      margin-block: $unnnic-spacing-ant - $unnnic-border-width-thinner
        $unnnic-spacing-ant;
    }

    .action {
      cursor: pointer;
      user-select: none;
      text-decoration: none;

      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-xs;
      padding: $unnnic-spacing-xs;
      border-radius: $unnnic-border-radius-sm;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

      &--scheme-error {
        color: $unnnic-color-aux-red-500;
      }

      &__icon {
        font-size: 1.125 * $unnnic-font-size;
      }

      &:hover {
        background-color: $unnnic-color-neutral-light;
      }

      & + .action {
        margin-top: $unnnic-spacing-xs;
      }
    }
  }
}
</style>
