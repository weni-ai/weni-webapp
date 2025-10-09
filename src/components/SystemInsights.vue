<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoadingModule from './modules/LoadingModule.vue';
import ExternalSystem from './ExternalSystem.vue';
import { tryImportWithRetries } from '@/utils/moduleFederation';
import { useSharedStore } from '@/store/Shared';
import { useModuleUpdateRoute } from '@/composables/useModuleUpdateRoute';
import getEnv from '../utils/env';

const insightsApp = ref(null);
const insightsAppDOM = ref(null);
const shadowRootRef = ref(null);

const insightsRouter = ref(null);
const useIframe = ref(false);
const iframeInsights = ref(null);

const isInsightsRoute = computed(() => ['insights'].includes(route.name));

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const sharedStore = useSharedStore();

const { getInitialModuleRoute } = useModuleUpdateRoute('insights');

// MutationObserver para observar estilos adicionados ao <head>
let styleObserver = null;
const observedStyles = new WeakSet();

function startObservingStyles(shadowRoot) {
  const insightsUrl = getEnv('MODULE_FEDERATION_INSIGHTS_URL');

  console.log('🔍 [Shadow Root] Iniciando observação de estilos');

  // Copiar estilos existentes do Insights que já estão no <head>
  copyExistingStyles(shadowRoot, insightsUrl);

  // Criar observer para novos estilos
  styleObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Element node
          const isStyleNode =
            node.tagName === 'STYLE' ||
            (node.tagName === 'LINK' && node.rel === 'stylesheet');

          if (isStyleNode && !observedStyles.has(node)) {
            const isInsightsStyle =
              (node.href && node.href.includes(insightsUrl)) ||
              (node.tagName === 'STYLE' && node.textContent);

            if (isInsightsStyle) {
              console.log('🎨 [Shadow Root] Novo estilo detectado:', node);
              cloneStyleToShadowRoot(node, shadowRoot);
            }
          }
        }
      });
    });
  });

  // Observar mudanças no <head>
  styleObserver.observe(document.head, {
    childList: true,
    subtree: false,
  });

  console.log('✅ [Shadow Root] Observação de estilos ativada');
}

function copyExistingStyles(shadowRoot, insightsUrl) {
  // Copiar estilos do Insights que já existem no <head>
  const existingStyles = document.head.querySelectorAll(
    'style, link[rel="stylesheet"]',
  );

  existingStyles.forEach((node) => {
    const isInsightsStyle =
      (node.href && node.href.includes(insightsUrl)) ||
      (node.tagName === 'STYLE' && node.textContent);

    if (isInsightsStyle && !observedStyles.has(node)) {
      console.log('🎨 [Shadow Root] Copiando estilo existente:', node);
      cloneStyleToShadowRoot(node, shadowRoot);
    }
  });
}

/**
 * Clona um nó de estilo (<link> ou <style>) para o Shadow Root
 * e remove do DOM principal para evitar vazamento de estilos
 *
 * @param {HTMLElement} node - Nó de estilo a ser clonado
 * @param {ShadowRoot} shadowRoot - Shadow Root de destino
 */
function cloneStyleToShadowRoot(node, shadowRoot) {
  // Marcar como observado para evitar duplicatas
  observedStyles.add(node);

  if (node.tagName === 'LINK') {
    // Para <link>, criar uma cópia
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = node.href;

    // Aguardar o carregamento antes de remover do DOM principal
    link.onload = () => {
      console.log('✅ [Shadow Root] <link> carregado, removendo do <head>');
      // Remover do DOM principal após carregar no Shadow Root
      if (node.parentNode) {
        node.remove();
      }
    };

    link.onerror = () => {
      console.warn(
        '⚠️ [Shadow Root] Erro ao carregar <link>, mantendo no <head>',
      );
    };

    shadowRoot.appendChild(link);
    console.log('🎨 [Shadow Root] <link> clonado para Shadow Root');
  } else if (node.tagName === 'STYLE') {
    // Para <style>, clonar o conteúdo
    const style = document.createElement('style');
    style.textContent = node.textContent;
    shadowRoot.appendChild(style);
    console.log('🎨 [Shadow Root] <style> clonado para Shadow Root');

    // Remover do DOM principal imediatamente (já está no Shadow Root)
    if (node.parentNode) {
      node.remove();
      console.log('✅ [Shadow Root] <style> removido do <head>');
    }
  }
}

function stopObservingStyles() {
  if (styleObserver) {
    styleObserver.disconnect();
    styleObserver = null;

    observedStyles.clear();
    console.log('✅ [Shadow Root] Observação de estilos desativada');
  }
}

async function mount({ force = false } = {}) {
  if (!force && !props.modelValue) {
    return;
  }

  const mountInsightsApp = await tryImportWithRetries(
    () => import('insights/main'),
    'insights/main',
  );

  console.log('📦 [Insights] mountInsightsApp carregado', mountInsightsApp);

  if (!mountInsightsApp) {
    fallbackToIframe();
    return;
  }

  const initialRoute = getInitialModuleRoute();

  // Aguardar o próximo tick para garantir que o Shadow Root existe
  await nextTick();

  // Obter o Shadow Root DOM real
  const shadowRoot = shadowRootRef.value?.$el?.shadowRoot;

  if (!shadowRoot) {
    console.error('❌ [Shadow Root] Shadow Root não encontrado');
    return;
  }

  // Iniciar observação de estilos ANTES de montar o app
  startObservingStyles(shadowRoot);

  const { app, router } = await mountInsightsApp({
    container: insightsAppDOM.value,
    initialRoute,
  });

  console.log('📦 [Insights] App montado', app);

  insightsApp.value = app;
  insightsRouter.value = router;
}

function fallbackToIframe() {
  useIframe.value = true;
  nextTick(() => {
    iframeInsights.value?.init(route.params);
  });
}

function unmount() {
  stopObservingStyles();
  insightsApp.value?.unmount();
  insightsApp.value = null;
}

async function remount() {
  await insightsRouter.value.replace({ name: 'home' });
  unmount();
  await nextTick();
  mount({ force: true });
}

onMounted(() => {
  window.addEventListener('forceRemountInsights', remount);
});

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue && !insightsApp.value) {
      mount();
    }
  },
  { immediate: true },
);

watch(
  () => sharedStore.current.project.uuid,
  (newProjectUuid, oldProjectUuid) => {
    if (newProjectUuid !== oldProjectUuid) {
      useIframe.value ? iframeInsights.value?.reset() : unmount();
    }
  },
);

onUnmounted(() => {
  unmount();
  stopObservingStyles();

  window.removeEventListener('forceRemountInsights', remount);
});
</script>

<template>
  <LoadingModule
    data-testid="insights-loading"
    :isModuleRoute="isInsightsRoute"
    :hasModuleApp="!!insightsApp"
    :useIframe="useIframe"
  />

  <template v-if="sharedStore.auth.token && sharedStore.current.project.uuid">
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
    <shadow-root ref="shadowRootRef">
      <section
        v-if="!useIframe"
        v-show="insightsApp && isInsightsRoute"
        id="insights-app"
        ref="insightsAppDOM"
        class="system-insights__system"
        data-testid="insights-app"
      />
    </shadow-root>
    <ExternalSystem
      v-if="useIframe"
      v-show="isInsightsRoute"
      ref="iframeInsights"
      data-testid="insights-iframe"
      :routes="['insights']"
      class="system-insights__iframe"
      dontUpdateWhenChangesLanguage
      name="insights"
    />
  </template>
</template>

<style scoped lang="scss">
.system-insights__system {
  height: 100%;
}

.system-insights__iframe {
  flex: 1;
  overflow: auto;
}
</style>
