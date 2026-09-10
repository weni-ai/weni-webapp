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
      <img src="@/assets/brand-name.svg" />
    </RouterLink>

    <ProjectSelector v-else-if="shouldShowProjectSelector" />

    <WarningTrialChip @click="$emit('openModalTrialPeriod')" />

    <section class="useful-links">
      <section class="useful-links__icons">
        <UnnnicToolTip
          v-for="(usefulLink, index) in usefulLinks"
          :key="index"
          class="useful-link__tooltip"
          :text="usefulLink.label"
          side="bottom"
          enabled
        >
          <section class="useful-link">
            <UnnnicButton
              type="tertiary"
              size="small"
              :iconCenter="usefulLink.icon"
              @click="usefulLink.onClick?.()"
            />

            <section
              v-if="usefulLink.hasUpdates"
              class="useful-link__notification-symbol"
            />
          </section>
        </UnnnicToolTip>
      </section>

      <ProfileDropdown />
    </section>
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
import ProjectSelector from './ProjectSelector.vue';
import i18n from '../../utils/plugins/i18n';
import { useNewsStore } from '@/store/news';
import { useRightBarStore } from '@/store/RightBar';
import { useOrgStore } from '@/store/org';
import { useProjectStore } from '@/store/project';

defineEmits(['openModalTrialPeriod']);

const instance = getCurrentInstance();

const newsStore = useNewsStore();
const rightBarStore = useRightBarStore();
const orgStore = useOrgStore();
const projectStore = useProjectStore();

const hasUpdates = computed(() => {
  const userLastViewedMonth = newsStore.lastViewedNews;

  const platformLastPublishedMoth = newsStore.platformNews.mostRecentMonth;

  return userLastViewedMonth !== platformLastPublishedMoth;
});

const usefulLinks = computed(() => [
  {
    icon: 'help',
    label: i18n.global.t('NAVBAR.LEARN.TITLE'),
    onClick: openLearningCenter,
  },
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

const shouldShowProjectSelector = computed(() => {
  return Boolean(projectStore.currentProject?.uuid);
});

function openLearningCenter() {
  rightBarStore.openRightBar({
    props: {
      type: 'LearningCenter',
    },
  });
}

function openNotifications() {
  rightBarStore.openRightBar({
    props: {
      type: 'Notifications',
      orgUuid: orgStore.currentOrg?.uuid,
    },
  });
}
</script>

<style lang="scss" scoped>
.topbar {
  $topbar-min-height: 3 * $unnnic-font-size;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  column-gap: $unnnic-spacing-sm;
  min-height: $topbar-min-height;
  box-sizing: border-box;

  background-color: $unnnic-color-bg-base;
  padding: $unnnic-spacing-xs $unnnic-spacing-sm;
  padding-bottom: $unnnic-spacing-xs - 1px;
  border-bottom: 1px solid $unnnic-color-border-base;

  &__logo {
    > img {
      height: calc($unnnic-icon-size-10 / 2);
    }
  }
}

.useful-links {
  margin-left: auto;

  display: flex;
  column-gap: $unnnic-space-2;
  align-items: center;

  &__icons {
    display: flex;
    column-gap: $unnnic-space-1;
    align-items: center;
  }

  .useful-link {
    position: relative;

    &__tooltip :deep(.unnnic-tooltip-label-bottom) {
      z-index: 10;
      margin-top: $unnnic-space-1;
    }

    &__notification-symbol {
      $border-width: 1px;
      $top-spacing: 0.5625 * $unnnic-font-size - $border-width;
      $right-spacing: 0.4375 * $unnnic-font-size - $border-width;

      position: absolute;
      top: $top-spacing;
      right: $right-spacing;
      border: $border-width solid $unnnic-color-bg-base;

      font-size: 5px;
      width: $unnnic-icon-size-xs;
      height: $unnnic-icon-size-xs;
      border-radius: $unnnic-border-radius-pill;
      background-color: $unnnic-color-fg-critical;

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
