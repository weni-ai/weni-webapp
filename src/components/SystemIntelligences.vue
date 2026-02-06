<template>
  <section
    v-show="showSystem"
    class="container"
  >
    <img
      v-if="loading"
      class="logo"
      src="../assets/LogoWeniAnimada4.svg"
    />

    <iframe
      v-show="!loading"
      ref="iframe"
      class="container container--full-height"
      allow="clipboard-read; clipboard-write; microphone; geolocation;"
      frameborder="0"
      @load="load"
    ></iframe>
  </section>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  nextTick,
  onMounted,
  getCurrentInstance,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { debounce } from 'lodash';
import getEnv from '../utils/env';
import sendAllIframes from '../utils/plugins/sendAllIframes';
import { useFeatureFlagsStore } from '@/store/featureFlags';
import i18n from '@/utils/plugins/i18n';

const route = useRoute();
const router = useRouter();
const store = useStore();
const { proxy } = getCurrentInstance();
const featureFlagsStore = useFeatureFlagsStore();

// --- Reactive State ---

const firstAccess = ref(true);
const loading = ref(false);
const urls = getEnv('MODULES_YAML');
const src = ref('');
const lastSystem = ref(null);
const paths = reactive({
  bothub: 'init',
  'agent-builder': 'init',
});
const lastProjectUuidLoaded = ref('');
const baseSrc = ref('');
const systems = ['bothub', 'agentBuilder'];
const iframe = ref(null);

// --- Computed ---

const currentOrg = computed(() => store.getters.currentOrg);
const currentProject = computed(() => store.getters.currentProject);

const showSystem = computed(() => systems.includes(route.name));

const paramInternalArray = computed(() => {
  return typeof route.params.internal === 'string'
    ? route.params.internal.split('/').filter((v) => v)
    : route.params.internal;
});

const params = computed(() => {
  const internal = paramInternalArray.value;

  let next = '';

  if (internal?.[0] === 'init') {
    if (route.name === 'agentBuilder') {
      next = 'router';
    }

    if (paths[route.name] && paths[route.name] !== 'init') {
      next = paths[route.name].join('/');
    }
  } else {
    next = internal?.join('/') || '';
  }

  return {
    org_uuid: currentOrg.value?.uuid,
    project_uuid: currentProject.value?.uuid,
    next,
  };
});

// --- Methods ---

function whatSystem(pathname) {
  return pathname.startsWith('/intelligences/') ? 'bothub' : 'agent-builder';
}

function load(event) {
  if (event.srcElement?.src === src.value) {
    loading.value = false;
  }
}

function setSrc(newSrc, urlParams) {
  loading.value = true;

  src.value = `${newSrc}?${new URLSearchParams(urlParams).toString()}`;

  lastProjectUuidLoaded.value = params.value.project_uuid;

  iframe.value.src = src.value;
}

function reload() {
  setSrc(baseSrc.value, params.value);
}

function loadIframe() {
  try {
    const { inteligence_organization } = currentOrg.value;
    const { uuid } = currentProject.value;

    const apiUrl = featureFlagsStore.flags.agentsTeam
      ? urls.agent_builder
      : urls.intelligence;
    if (!apiUrl) return null;

    const { owner, slug } = route.params;

    if (owner && slug) {
      setSrc(`${apiUrl}dashboard/${owner}/${slug}/`);
    } else {
      baseSrc.value = `${apiUrl}${inteligence_organization}/${uuid}/`;

      reload();
    }
  } catch (e) {
    return e;
  }
}

function pathChanged() {
  if (
    systems.includes(route.name) &&
    (firstAccess.value || lastSystem.value !== route.name)
  ) {
    firstAccess.value = false;
    nextTick(loadIframe);
  } else if (
    systems.includes(route.name) &&
    lastSystem.value === route.name &&
    paramInternalArray.value.join('/') !== paths[lastSystem.value].join('/')
  ) {
    router.replace({
      params: {
        internal: paths[lastSystem.value],
      },
    });
  }
}

// --- Watchers ---

watch(paramInternalArray, (internal) => {
  if (
    internal?.[0] === 'init' &&
    lastProjectUuidLoaded.value !== params.value.project_uuid &&
    systems.includes(route.name)
  ) {
    loadIframe();
  }
});

watch(
  () => route.fullPath,
  () => {
    pathChanged();
  },
);

watch(
  () => route.params.projectUuid,
  () => {
    if (!firstAccess.value) {
      reload();
    }
  },
);

watch(
  () => i18n.global.locale,
  debounce(() => {
    if (!firstAccess.value) {
      reload();
    }
  }, 5000),
);

watch(
  () => featureFlagsStore.flags.agentsTeam,
  () => {
    reload();
  },
);

// --- Lifecycle ---

onMounted(() => {
  pathChanged();

  window.addEventListener('message', (event) => {
    if (!src.value) {
      return;
    }

    const srcOrigin = new URL(src.value).origin;

    const isIntelligence =
      srcOrigin.includes('intelligence') &&
      event.origin.includes('intelligence');

    const shouldIgnoreThisEvent = !isIntelligence || event.origin !== srcOrigin;
    if (shouldIgnoreThisEvent) {
      return;
    }

    if (event.data?.event === 'changePathname') {
      lastSystem.value = whatSystem(event.data.pathname);
      paths[lastSystem.value] = event.data.pathname
        .split('/')
        .slice(1)
        .filter((item) => item);

      const paramsInternal =
        route.params.internal.join?.('/') || route.params.internal;

      if (paramsInternal !== paths[lastSystem.value].join('/')) {
        router.replace({
          name: lastSystem.value,
          params: {
            internal: paths[lastSystem.value],
          },
        });
      }
    } else if (event.data?.event === 'getToken') {
      sendAllIframes('updateToken', { token: proxy.$keycloak.token });
    } else if (event.data?.event === 'upgrade-to-multi-agents') {
      featureFlagsStore.agentsTeam = true;
    }
  });
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  height: auto;

  &--full-height {
    height: 100%;
  }

  .logo {
    max-width: 4 * $unnnic-font-size;
    max-height: 4 * $unnnic-font-size;
  }
}
</style>
