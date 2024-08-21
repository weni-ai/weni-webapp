<template>
  <section class="topbar">
    <WarningTrialChip />

    <section class="useful-links">
      <UnnnicToolTip
        v-for="(usefulLink, index) in usefulLinks"
        :key="index"
        class="useful-link__tooltip"
        :text="usefulLink.label"
        side="bottom"
        enabled
      >
        <RouterLink
          v-if="usefulLink.route"
          class="useful-link"
          :to="usefulLink.route"
        >
          <UnnnicIcon
            :icon="usefulLink.icon"
            scheme="inherit"
          />
        </RouterLink>

        <section
          v-else-if="usefulLink.onClick"
          class="useful-link"
          @click="usefulLink.onClick"
        >
          <UnnnicIcon
            :icon="usefulLink.icon"
            scheme="inherit"
          />
        </section>
      </UnnnicToolTip>
    </section>

    <ProfileDropdown />
  </section>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';

import WarningTrialChip from '@/components/billing/WarningTrialChip.vue';
import ProfileDropdown from './ProfileDropdown.vue';
import i18n from '../../utils/plugins/i18n';

const instance = getCurrentInstance();

function use(name) {
  return computed(() => {
    const { proxy } = instance;
    const item = proxy[`$${name}`];
    return item;
  });
}

const store = use('store');

const usefulLinks = computed(() => [
  {
    icon: 'help',
    label: i18n.t('NAVBAR.HELP'),
    route: {
      name: 'help',
    },
  },
  {
    icon: 'notifications',
    label: i18n.t('NAVBAR.NEWS'),
    onClick: openNotifications,
  },
]);

function openNotifications() {
  store.value.dispatch('openRightBar', {
    props: {
      type: 'Notifications',
      orgUuid: store.value.getters.currentOrg?.uuid,
    },
  });
}
</script>

<style lang="scss" scoped>
.topbar {
  $topbar-min-height: 4 * $unnnic-font-size;

  display: flex;
  align-items: center;
  justify-content: right;
  column-gap: $unnnic-spacing-sm;
  min-height: $topbar-min-height;
  box-sizing: border-box;

  background-color: $unnnic-color-neutral-white;
  padding: $unnnic-spacing-xs $unnnic-spacing-sm;
  padding-bottom: $unnnic-spacing-xs - $unnnic-border-width-thinner;
  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
}

.useful-links {
  display: flex;
  column-gap: $unnnic-spacing-xs;
  align-items: center;

  .useful-link {
    display: flex;
    padding: $unnnic-spacing-xs;
    text-decoration: none;
    user-select: none;
    cursor: pointer;

    color: $unnnic-color-neutral-cloudy;

    &:hover {
      color: $unnnic-color-neutral-darkest;
    }

    &__tooltip :deep(.unnnic-tooltip-label-bottom) {
      margin-top: $unnnic-spacing-nano;
    }
  }
}
</style>
