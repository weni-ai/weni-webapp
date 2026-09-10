<template>
  <UnnnicPopover
    :open="isProfileDropdownOpen"
    @update:open="isProfileDropdownOpen = $event"
  >
    <UnnnicPopoverTrigger>
      <section
        class="profile"
        :class="{ 'profile--selected': isProfileDropdownOpen }"
        data-test="dropdown-trigger"
      >
        <ProfilePictureDefault
          v-if="photoWithError || !photo"
          :text="initialLetter"
          class="profile__picture"
        />

        <img
          v-else
          :src="photo"
          class="profile__picture"
          data-test="profile-image"
          @error="photoWithError = true"
        />
      </section>
    </UnnnicPopoverTrigger>

    <UnnnicPopoverContent
      side="bottom"
      align="end"
      width="280px"
    >
      <section
        v-if="currentView === 'actions'"
        class="profile-dropdown__actions"
      >
        <template
          v-for="action in actions"
          :key="action.testId"
        >
          <RouterLink
            v-if="action.viewUrl"
            :to="action.viewUrl"
            class="profile-dropdown__link"
            :data-test="action.testId"
            @click="isProfileDropdownOpen = false"
          >
            <UnnnicPopoverOption
              :label="action.label"
              :icon="action.icon"
            />
          </RouterLink>

          <UnnnicPopoverOption
            v-else-if="action.trailingIcon"
            :label="action.label"
            :icon="action.icon"
            :data-test="action.testId"
            @click.stop="action.onClick"
          >
            <span class="profile-dropdown__option-label">
              {{ action.label }}
            </span>
            <UnnnicIcon
              :icon="action.trailingIcon"
              size="ant"
              scheme="inherit"
              class="profile-dropdown__trailing-icon"
            />
          </UnnnicPopoverOption>

          <UnnnicPopoverOption
            v-else
            :label="action.label"
            :icon="action.icon"
            :scheme="action.scheme"
            :data-test="action.testId"
            @click.stop="action.onClick"
          />
        </template>
      </section>

      <ProfileLanguageSelector
        v-else
        @back="currentView = 'actions'"
      />
    </UnnnicPopoverContent>
  </UnnnicPopover>
</template>

<script setup>
import { computed, getCurrentInstance, onUnmounted, ref, watch } from 'vue';

import ProfilePictureDefault from './ProfilePictureDefault.vue';
import ProfileLanguageSelector from './ProfileLanguageSelector.vue';
import i18n from '@/utils/plugins/i18n.js';
import { useAccountStore } from '@/store/account';
import { useModalStore } from '@/store/modal';
import { useOrgStore } from '@/store/org';

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

const keycloak = use('keycloak');
const accountStore = useAccountStore();
const modalStore = useModalStore();
const orgStore = useOrgStore();

const photoWithError = ref(false);
const isProfileDropdownOpen = ref(false);
const currentView = ref('actions');

function setIframesPointerEvents(enabled) {
  document.querySelectorAll('iframe').forEach((iframe) => {
    iframe.style.pointerEvents = enabled ? '' : 'none';
  });
}

watch(isProfileDropdownOpen, (isOpen) => {
  if (!isOpen) currentView.value = 'actions';

  setIframesPointerEvents(!isOpen);
});

onUnmounted(() => {
  setIframesPointerEvents(true);
});

const initialLetter = computed(() => {
  const name =
    getProfileProperty('first_name') || getProfileProperty('username') || '';

  return String(name).trim().slice(0, 1).toUpperCase();
});

const photo = computed(() => {
  return getProfileProperty('photo');
});

function getProfileProperty(property) {
  return accountStore.profile?.[property];
}

const actions = computed(() => {
  const actions = [];

  actions.push(
    ...[
      {
        icon: 'person',
        label: i18n.global.t('NAVBAR.ACCOUNT'),
        viewUrl: '/account/edit',
        testId: 'account',
      },
      {
        icon: 'swap_horiz',
        label: i18n.global.t('NAVBAR.CHANGE_ORG'),
        viewUrl: '/orgs',
        testId: 'see-all-orgs',
      },
    ],
  );

  const routeParams = instance.proxy['$route'].params;

  if (
    (routeParams.orgUuid || routeParams.projectUuid) &&
    [ORG_ROLE_ADMIN, ORG_ROLE_FINANCIAL].includes(
      orgStore.org?.authorization.role,
    )
  ) {
    actions.push(
      ...[
        {
          icon: 'paid',
          label: i18n.global.t('NAVBAR.YOUR_PLAN'),
          viewUrl: `/orgs/${orgStore.org?.uuid}/billing`,
          testId: 'billing',
        },
      ],
    );
  }

  actions.push(
    ...[
      {
        icon: 'language',
        label: i18n.global.t('language_selector.title'),
        trailingIcon: 'arrow_forward_ios',
        onClick: () => {
          currentView.value = 'languages';
        },
        testId: 'languages',
      },
      {
        icon: 'logout',
        scheme: 'fg-critical',
        label: i18n.global.t('NAVBAR.LOGOUT'),
        onClick: showLogoutModal,
        testId: 'logout',
      },
    ],
  );

  return actions;
});

function showLogoutModal() {
  isProfileDropdownOpen.value = false;

  modalStore.openModal({
    type: 'confirm',
    data: {
      icon: 'logout',
      scheme: 'feedback-red',
      title: i18n.global.t('NAVBAR.LOGOUT'),
      description: i18n.global.t('NAVBAR.LOGOUT_MESSAGE'),
      cancelText: i18n.global.t('NAVBAR.CANCEL'),
      confirmText: i18n.global.t('NAVBAR.LOGOUT'),
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
  border-radius: $unnnic-radius-2;

  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;

  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;

  &:hover,
  &--selected {
    background-color: $unnnic-color-bg-base-soft;
  }

  &__picture {
    padding: $unnnic-space-1;
  }
}

.profile-dropdown {
  &__actions {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-space-2;
    width: 100%;
  }

  &__link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  &__option-label {
    color: $unnnic-color-fg-emphasized;
  }

  &__trailing-icon {
    margin-inline-start: auto;
  }
}
</style>
