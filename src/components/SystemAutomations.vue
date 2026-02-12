<template>
  <section
    v-show="pages.includes($route.name)"
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
      allow="clipboard-read; clipboard-write;"
      frameborder="0"
      @load="handleLoad"
    ></iframe>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import getEnv from '../utils/env';
import i18n from '@/utils/plugins/i18n';

const route = useRoute();
const store = useStore();
const { proxy } = getCurrentInstance();

const pages = ['automations'];
const loading = ref(true);
const src = ref('');
const alreadyInitialized = ref(false);
const iframe = ref(null);

const currentOrg = computed(() => store.getters.currentOrg);
const currentProject = computed(() => store.getters.currentProject);
const accountProfile = computed(() => store.state.Account.profile);

const params = computed(() => {
  const accessToken = `Bearer ${proxy.$keycloak.token}`;

  const locales = {
    'pt-br': 'pt-BR',
    es: 'es-ES',
    en: 'en-US',
  };

  return {
    embedded_within: 'Weni Platform',
    org_uuid: currentOrg.value?.uuid,
    project_uuid: currentProject.value?.uuid,
    locale: locales[i18n.global.locale],
    user_email: accountProfile.value?.email,
    access_token: accessToken,
  };
});

function handleLoad(event) {
  if (event.srcElement.src === src.value) {
    loading.value = false;
  }
}

function setSrc(newSrc) {
  loading.value = true;

  const url = new URL(newSrc);

  Object.entries(params.value).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  src.value = url.toString();
  iframe.value.setAttribute('src', src.value);
}

function loadIframe() {
  alreadyInitialized.value = true;

  setSrc(getEnv('MODULES_YAML').gallery);
}

watch(
  params,
  () => {
    alreadyInitialized.value = false;

    if (pages.includes(route.name)) {
      nextTick(() => {
        loadIframe();
      });
    }
  },
  { deep: true },
);

watch(
  () => route.fullPath,
  () => {
    if (pages.includes(route.name) && !alreadyInitialized.value) {
      nextTick(() => {
        loadIframe();
      });
    }
  },
  { immediate: true },
);
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
