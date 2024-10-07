<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="settings-container">
    <div class="options">
      <UnnnicCard
        v-for="page in pages"
        :key="page.href.name"
        type="account"
        :icon="$route.name === page.href.name ? page.icon[0] : page.icon[1]"
        :title="page.title"
        :description="page.description"
        :enabled="currentRouteName === page.href.name"
        @click="navigateToPage(page)"
      />
    </div>

    <div class="separator"></div>

    <ExternalSystem
      ref="system-project"
      :routes="['settingsProject']"
      class="page"
    />

    <ExternalSystem
      ref="system-chats-settings"
      :routes="['settingsChats']"
      class="page"
    />
  </div>
</template>


<script setup>
import { computed, watch, ref, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import getEnv from '@/utils/env';
import { PROJECT_ROLE_CHATUSER } from '../components/users/permissionsObjects';
import ExternalSystem from '@/components/ExternalSystem.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const systemProjectRef = ref(null);
const systemChatsSettingsRef = ref(null);

const currentProject = computed(() => store.getters.currentProject);
const currentRouteName = computed(() => route.name);

const hideModulesButChats = computed(() => {
  return (
    getEnv('MODULES_YAML').chats &&
    currentProject.value.authorization.role === PROJECT_ROLE_CHATUSER
  );
});

const pages = computed(() => {
  const options = [];

  if (!hideModulesButChats.value) {
    options.push({
      title: 'Project Settings',
      description: 'Settings for the project.',
      icon: ['cog-2', 'settings'],
      href: {
        name: 'settingsProject',
        params: { internal: ['init'] },
      },
      hrefForceReload: {
        name: 'settingsProject',
        params: { internal: ['r', 'init'] },
      },
    });
  }

  if (getEnv('MODULES_YAML').chats) {
    options.push({
      title: 'Chats Settings',
      description: 'Settings for chats.',
      icon: ['messaging-we-chat-2', 'forum'],
      href: {
        name: 'settingsChats',
        params: { internal: ['init'] },
      },
      hrefForceReload: {
        name: 'settingsChats',
        params: { internal: ['r', 'init'] },
      },
    });
  }

  return options;
});

const navigateToPage = (page) => {
  const targetRoute = currentRouteName.value === page.href.name ? page.hrefForceReload : page.href;
  router.push(targetRoute);
};

const initCurrentExternalSystem = () => {
  const current = route.name;

  if (current === 'settingsProject') {
    systemProjectRef.value?.init(route.params);
  } else if (current === 'settingsChats') {
    systemChatsSettingsRef.value?.init(route.params);
  }
};

watch(
  () => route.fullPath,
  () => {
    nextTick(() => {
      if (['settingsProject', 'settingsChats'].includes(route.name)) {
      initCurrentExternalSystem();
    }})
  },
  { immediate: true }
);

watch(
  () => route.name,
  () => {
    if (!pages.value.some(({ href: { name } }) => name === route.name)) {
      router.replace(pages.value[0].href);
    }
  },
  { immediate: true }
);

watch(
  () => route.params.projectUuid,
  async (newUuid) => {
    if (!newUuid) return;

    systemProjectRef.value?.reset();
    systemChatsSettingsRef.value?.reset();
  }
);
</script>

<style lang="scss" scoped>
.settings-container {
  padding: $unnnic-spacing-inset-md;

  display: flex;

  .options {
    width: 20.75rem;
    height: fit-content;
  }

  .separator {
    width: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: 0 $unnnic-spacing-inline-sm;
  }

  .page {
    flex: 1;
  }
}

.unnnic-card-account {
  user-select: none;
  cursor: pointer;

  & + .unnnic-card-account {
    margin-top: 0.625rem;
  }
}
</style>
