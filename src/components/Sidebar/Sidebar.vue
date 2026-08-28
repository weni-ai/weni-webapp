<template>
  <section :class="['sidebar', { 'sidebar--is-expanded': isExpanded }]">
    <RouterLink
      :to="{ name: 'orgs' }"
      class="sidebar__logo"
    >
      <section class="sidebar__logo-outer">
        <img src="@/assets/brand-name.svg" />
      </section>
    </RouterLink>

    <section class="pages">
      <section
        v-for="(group, index) in availableOptions"
        :key="index"
        class="page-group"
      >
        <p
          v-if="group.label && isExpanded"
          class="page-group__label"
        >
          {{ group.label }}
        </p>
        <template
          v-for="option in group.items"
          :key="option"
        >
          <SidebarOption
            :option="option"
            :isExpanded="isExpanded"
          />
        </template>
      </section>
    </section>

    <footer class="sidebar__footer">
      <SidebarOption
        :option="{
          label: isExpanded ? $t('SIDEBAR.HIDE') : $t('SIDEBAR.SHOW'),
          icon: 'chevron_right',
        }"
        :isExpanded="isExpanded"
        variant="static"
        :iconRotate180deg="isExpanded"
        @click="isExpanded = !isExpanded"
      />
    </footer>
  </section>
</template>

<script>
export default {
  name: 'SidebarComponent',
};
</script>

<script setup>
import moment from 'moment';
import { computed, ref, watch, onMounted, onBeforeUnmount, inject } from 'vue';
import { gbKey } from '@/utils/growthbook';

import env from '@/utils/env';

import SidebarOption from './SidebarOption.vue';
import { createSidebarModules } from './sidebarModules.js';
import {
  PROJECT_ROLE_CHATUSER,
  PROJECT_ROLE_CONTRIBUTOR,
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_MARKETING,
} from '@/components/users/permissionsObjects.js';
import brainAPI from '@/api/brain';

import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useFeatureFlagsStore } from '@/store/featureFlags';
import { useOrgStore } from '@/store/org';
import { useProjectStore } from '@/store/project';

const projectStore = useProjectStore();
const orgStore = useOrgStore();
const route = useRoute();
const { t } = useI18n();

const featureFlagsStore = useFeatureFlagsStore();

const growthbook = inject(gbKey);

const canAccessAutomationsModule = ref(
  growthbook?.isOn('can_access_gallery_module'),
);

const props = defineProps({
  unreadMessages: { type: Number, default: 0 },
});

const isExpanded = ref(true);

const BrainOn = ref(false);

const project = computed(() => projectStore.currentProject);
const org = computed(() => orgStore.currentOrg);

const isAgentBuilder2 = computed(() => {
  return featureFlagsStore.flags.agentsTeam;
});

watch(
  () => orgStore.currentOrg?.uuid,
  (orgUuid) => {
    if (orgUuid) {
      loadProjects({ orgUuid });
    }
  },
  { immediate: true },
);

watch(
  () => projectStore.currentProject?.uuid,
  (projectUuid) => {
    if (projectUuid) {
      loadBrain(projectUuid);
    }
  },
  { immediate: true },
);

async function loadBrain(projectUuid) {
  try {
    const { data } = await brainAPI.read({
      projectUuid,
    });
    BrainOn.value = data.brain_on;
  } catch (e) {
    console.error('loadBrain Error:', e);
  }
}

function handleEvent(event) {
  const { event: eventName, value: eventValue } = event.data;

  if (!eventName || !eventValue) return;

  const events = {
    'change-brain-status': (value) => {
      BrainOn.value = JSON.parse(value);
    },
  };

  if (eventName in events) {
    events[eventName](eventValue);
  }
}

onMounted(() => {
  window.addEventListener('message', handleEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleEvent);
});

const isToContract = computed(() => {
  return route.meta?.forceContractedSidebar;
});

watch(
  () => route.path,
  () => {
    if (isToContract.value) {
      isExpanded.value = false;
    }
  },
  { immediate: true },
);

// Helper to generate project URLs
const projectUrl = (path) => `/projects/${project.value?.uuid}/${path}`;

// Extracted permission computed properties
const userRole = computed(
  () => projectStore.currentProject?.authorization?.role,
);

const isRoleChatUser = computed(() => userRole.value === PROJECT_ROLE_CHATUSER);

const isRoleMarketing = computed(
  () => userRole.value === PROJECT_ROLE_MARKETING,
);

const BULK_SEND_ALLOWED_ROLES = [
  PROJECT_ROLE_CONTRIBUTOR,
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_MARKETING,
];

const hasBulkSendPermission = computed(
  () =>
    BULK_SEND_ALLOWED_ROLES.includes(userRole.value) &&
    projectStore.currentProject?.has_wpp_channel,
);

const isProjectAllowedToUseBothub = computed(
  () =>
    moment(project.value?.created_at).year() < 2025 ||
    env('PROJECTS_BOTHUB_ALLOWED')?.split(',').includes(project.value?.uuid),
);

const options = computed(() => {
  const modules = createSidebarModules({
    projectUrl,
    brainOn: BrainOn.value,
    unreadMessages: props.unreadMessages,
    isAgentBuilder2: isAgentBuilder2.value,
    isProjectAllowedToUseBothub: isProjectAllowedToUseBothub.value,
    canAccessAutomations: canAccessAutomationsModule.value,
    hasBulkSendPermission: hasBulkSendPermission.value,
  });

  if (isRoleChatUser.value) {
    return [{ items: [modules.chats] }, { items: [modules.settings] }];
  }

  if (isRoleMarketing.value) {
    return [
      { items: [modules.insights] },
      { items: [modules.push] },
      { items: [modules.studio, modules.bulkSend].filter(Boolean) },
    ];
  }

  return [
    { items: [modules.insights] },
    {
      label: t('SIDEBAR.GROUPS.AGENT_BUILDER'),
      items: [
        ...(isAgentBuilder2.value
          ? [modules.aiAgents, modules.aiBuild]
          : [modules.ai]),
        modules.automations,
        modules.push,
      ].filter(Boolean),
    },
    modules.bulkSend
      ? { label: t('SIDEBAR.GROUPS.WHATSAPP'), items: [modules.bulkSend] }
      : null,
    {
      label: t('SIDEBAR.GROUPS.OPERATIONS'),
      items: [modules.chats, modules.aiConversations, modules.studio].filter(
        Boolean,
      ),
    },
    { items: [modules.settings] },
  ].filter(Boolean);
});

const availableOptions = computed(() => {
  return options.value.filter((group) => group && group.items.length > 0);
});
</script>

<style lang="scss" scoped>
$icon-size: 22px; // This size does not exists in Design System
$icon-padding: ($unnnic-space-2 * 2);
$icon-container-size: calc($icon-size + $icon-padding);
$sidebar-width: calc($icon-container-size + ($unnnic-space-3 * 2));

.pages {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-sm;
}

.page-group {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-nano;

  + .page-group {
    margin-top: -$unnnic-spacing-xs - 1px;
    padding-top: $unnnic-spacing-xs;
    border-top: 1px solid $unnnic-color-border-base;
  }

  &__label {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
    user-select: none;
    white-space: nowrap;
    margin: 0;
  }
}

.sidebar {
  width: $sidebar-width;
  box-sizing: border-box;
  transition: width 300ms;

  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-ant;

  padding: $unnnic-space-3;

  background-color: $unnnic-color-bg-base-soft;
  border-right: 1px solid $unnnic-color-border-base;

  height: 100%;

  &__logo:hover {
    background-color: $unnnic-color-border-muted;
  }

  &__logo-outer {
    overflow: hidden;
    transition: height 200ms;
    height: calc($unnnic-icon-size-10 / 2);
  }

  &__logo {
    display: flex;
    align-items: center;

    min-width: $unnnic-icon-size-10;
    height: $unnnic-icon-size-10;
    box-sizing: border-box;

    padding: $unnnic-space-2;
    border-radius: $unnnic-radius-2;
    user-select: none;

    img {
      height: 100%;
    }
  }

  &__footer {
    margin-top: auto;

    * {
      color: $unnnic-color-fg-muted;
    }
  }

  &--is-expanded {
    width: 16.875 * $unnnic-font-size;
  }
}
</style>
