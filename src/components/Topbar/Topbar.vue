<template>
  <section
    v-if="['normal', 'secondary'].includes(theme)"
    class="topbar"
  >
    <RouterLink
      v-if="shouldShowTopbarLogo"
      :to="{ name: 'orgs' }"
      class="topbar__logo"
    >
      <img src="@/assets/brand-name-weni-600.svg" />
    </RouterLink>

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
        <component
          :is="usefulLink.route ? 'RouterLink' : 'section'"
          class="useful-link"
          :to="usefulLink.route"
          @click="usefulLink.onClick ? usefulLink.onClick() : undefined"
        >
          <UnnnicIcon
            :icon="usefulLink.icon"
            scheme="inherit"
          />

          <section
            v-if="usefulLink.hasUpdates"
            class="useful-link__notification-symbol"
          />
        </component>
      </UnnnicToolTip>
    </section>

    <ProfileDropdown />
  </section>
</template>

<script>
export default {
  name: 'TopbarComponent',
};
</script>

<script setup>
import { computed, getCurrentInstance } from 'vue';

import WarningTrialChip from '@/components/billing/WarningTrialChip.vue';
import ProfileDropdown from './ProfileDropdown.vue';
import i18n from '../../utils/plugins/i18n';

const instance = getCurrentInstance();

const store = instance.proxy['$store'];

const hasUpdates = computed(() => {
  const userLastViewedMonth = store.state.News.lastViewedNews;

  const platformLastPublishedMoth =
    store.state.News.platformNews.mostRecentMonth;

  return userLastViewedMonth !== platformLastPublishedMoth;
});

const usefulLinks = computed(() => [
  {
    icon: 'school',
    label: i18n.global.t('NAVBAR.LEARN.TITLE'),
    onClick: openLearningCenter,
  },
  /* {
    icon: 'help',
    label: i18n.global.t('NAVBAR.HELP'),
    route: {
      name: 'help',
    },
  }, */
  {
    icon: 'notifications',
    label: i18n.global.t('NAVBAR.NEWS'),
    hasUpdates: hasUpdates.value,
    onClick: openNotifications,
  },
]);

const shouldShowTopbarLogo = computed(() => {
  const pages = ['orgs', 'projects'];

  return pages.includes(instance.proxy['$route'].name);
});

function openLearningCenter() {
  store.dispatch('openRightBar', {
    props: {
      type: 'LearningCenter',
    },
  });
}

function openNotifications() {
  store.dispatch('openRightBar', {
    props: {
      type: 'Notifications',
      orgUuid: store.getters.currentOrg?.uuid,
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

  &__logo {
    margin-right: auto;
  }
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
      z-index: 10;
      margin-top: $unnnic-spacing-nano;
    }

    &__notification-symbol {
      $border-width: $unnnic-border-width-thinner;
      $top-spacing: 0.5625 * $unnnic-font-size - $border-width;
      $right-spacing: 0.4375 * $unnnic-font-size - $border-width;

      position: absolute;
      top: $top-spacing;
      right: $right-spacing;
      border: $border-width solid white;

      font-size: 5px;
      width: $unnnic-icon-size-xs;
      height: $unnnic-icon-size-xs;
      border-radius: $unnnic-border-radius-pill;
      background-color: $unnnic-color-aux-red-500;

      animation:
        fade-in 100ms,
        bounce 5s;
      animation-iteration-count: 1, infinite;
    }
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounce {
  0%,
  4%,
  10%,
  20% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0);
  }
  8%,
  8.6% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -2em, 0) scaleY(1.1);
  }
  14% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -1em, 0) scaleY(1.05);
  }
  16% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0) scaleY(0.95);
  }
  18% {
    transform: translate3d(0, -0.5em, 0) scaleY(1.02);
  }
}
</style>
