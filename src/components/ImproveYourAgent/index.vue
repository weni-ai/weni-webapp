<template>
  <article class="improve-your-agent" v-if="!allTriggersClicked" data-test-id="improve-your-agent">
    <Transition name="slide-fade">
      <section
        v-if="isImprovesOpen"
        ref="improveContentRef"
        class="improve-your-agent__content"
        data-test-id="improve-your-agent-content"
        :class="{ 'improve-your-agent__content--active': isImprovesOpen }"
      >
        <header class="content__header" data-test-id="content__header">
          <UnnnicIcon
            data-test-id="content__header-icon"
            icon="auto_awesome"
            filled
            scheme="neutral-white"
            size="md"
          />
          <p 
            class="header__title" 
            data-test-id="header__title"
          >
          {{ $t('home.improve_your_agent.title') }}
          </p>
        </header>

        <ol class="content__improves">
          <li
            v-for="(improve, index) in improves"
            :key="index"
            data-test-id="content__improves-item"
          >
            <ItemCollapse
              data-test-id="item-collapse"
              :icon="improve.icon"
              :title="improve.title"
              :description="improve.description"
              :open="improveOpened === index"
              @update:open="improveOpened = $event ? index : null"
              @show-me="improve.trigger"
            />
          </li>
        </ol>

        <button 
          class="content__dont-show"
          @click="handleDontShowAgain"
          data-test-id="content__dont-show"
        >
          {{ $t('home.improve_your_agent.dont_show_me_again') }}
        </button>
      </section>
    </Transition>

    <button
      class="improve-your-agent__button"
      @click="toggleImproves"
      data-test-id="improve-your-agent-button"
    >
      <UnnnicIcon
        data-test-id="improve-your-agent-icon"
        icon="auto_awesome"
        filled
        scheme="weni-500"
        size="avatar-nano"
      />
    </button>
  </article>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import i18n from '../../utils/plugins/i18n';
import ItemCollapse from './ItemCollapse.vue';

const props = defineProps({
  urlRoutes: {
    type: Object,
    required: true,
    default: () => ({
      home: '',
      integrations: '',
      agent_builder: ''
    }),
    validator: (value) => {
      return ['home', 'integrations', 'agent_builder'].every(key => key in value);
    }
  }
});

const router = useRouter();
const STORAGE_KEY = 'improve-agent-preferences';
const TRIGGERS_KEY = 'improve-agent-triggers';
const improveOpened = ref(0);
const isImprovesOpen = ref(false);
const improveContentRef = ref(null);
const triggersClicked = ref({
  home: false,
  integrations: false,
  personalization: false,
  performance: false
});

const allTriggersClicked = computed(() => {
  return Object.values(triggersClicked.value).every(value => value);
});

const improves = computed(() => {
  const contextTranslate = (value) =>
    i18n.global.t(`home.improve_your_agent.${value}`);

  return [
    {
      icon: 'storefront',
      title: contextTranslate('commerce_skills.title'),
      description: contextTranslate('commerce_skills.description'),
      trigger: () => handleNavigation('home', 'home'),
    },
    {
      icon: 'browse',
      title: contextTranslate('communication_channels.title'),
      description: contextTranslate('communication_channels.description'),
      trigger: () => handleNavigation('integrations', 'integrations'),
    },
    {
      icon: 'neurology',
      title: contextTranslate('personalization.title'),
      description: contextTranslate('personalization.description'),
      trigger: () => handleNavigation('agent_builder', 'personalization'),
    },
    {
      icon: 'monitoring',
      title: contextTranslate('track_performance.title'),
      description: contextTranslate('track_performance.description'),
      trigger: () => handleNavigation('agent_builder', 'performance'),
    },
  ];
});

function loadTriggerState() {
  try {
    const savedTriggers = JSON.parse(localStorage.getItem(TRIGGERS_KEY) || '{}');
    triggersClicked.value = {
      ...triggersClicked.value,
      ...savedTriggers
    };
  } catch (error) {
    console.error('Error loading trigger state:', error);
  }
}

function saveTriggerState() {
  try {
    localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggersClicked.value));
  } catch (error) {
    console.error('Error saving trigger state:', error);
  }
}

function handleNavigation(route, triggerKey) {
  const targetRoute = props.urlRoutes[route];
  if (targetRoute) {
    triggersClicked.value[triggerKey] = true;
    saveTriggerState();
    router.push(targetRoute);
    isImprovesOpen.value = false;
  } else {
    console.error(`Route ${route} not found in urlRoutes`);
  }
}

function loadPreferences() {
  try {
    const preferences = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    isImprovesOpen.value = (preferences.openByDefault !== false);
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

function handleDontShowAgain() {
  isImprovesOpen.value = false;
  savePreferences({
    openByDefault: false
  });
}

function toggleImproves() {
  isImprovesOpen.value = !isImprovesOpen.value;
  savePreferences({
    openByDefault: isImprovesOpen.value
  });
}

function handleClickOutside(event) {
  const toggleButton = document.querySelector('.improve-your-agent__button');
  if (toggleButton && toggleButton.contains(event.target)) {
    return;
  }

  if (improveContentRef.value && !improveContentRef.value.contains(event.target)) {
    isImprovesOpen.value = false;
    savePreferences({
      openByDefault: false
    });
  }
}

onMounted(() => {
  loadPreferences();
  loadTriggerState();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
.improve-your-agent {
  z-index: 999;
  position: fixed;
  bottom: $unnnic-border-radius-lg;
  right: $unnnic-border-radius-lg;

  display: flex;
  gap: $unnnic-spacing-xs;
  flex-direction: column;
  align-items: flex-end;

  width: calc((100% / 12) * 4);

  &__content {
    border-radius: $unnnic-border-radius-lg - $unnnic-border-radius-sm;

    padding: $unnnic-spacing-md;

    background-color: $unnnic-color-neutral-black;

    width: 100%;
    box-sizing: border-box;

    .content__header {
      margin-bottom: $unnnic-spacing-md;

      border-bottom: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-darkest;

      padding-bottom: $unnnic-spacing-md;

      display: flex;
      gap: $unnnic-spacing-xs;
      align-items: center;

      .header__title {
        color: $unnnic-color-neutral-white;
        font-weight: $unnnic-font-weight-black;
        font-size: $unnnic-font-size-title-sm;
        line-height: 0;
      }
    }

    .content__improves {
      margin: 0;
      padding: 0;

      display: grid;
      gap: $unnnic-spacing-md;

      list-style: none;
    }

    .content__dont-show {
      margin-top: $unnnic-spacing-md;

      border: none;
      background-color: transparent;

      color: $unnnic-color-neutral-clean;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      text-decoration-line: underline;

      cursor: pointer;
    }
  }

  &__button {
    border: none;

    padding: $unnnic-spacing-ant $unnnic-spacing-md;

    border-radius: $unnnic-border-radius-lg - $unnnic-border-radius-sm;
    background-color: $unnnic-color-neutral-black;

    cursor: pointer;
  }
}

.slide-fade-enter-active {
  transition: all 100ms ease-out;
}

.slide-fade-leave-active {
  transition: all 100ms cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY($unnnic-spacing-sm);
  opacity: 0;
}
</style>
