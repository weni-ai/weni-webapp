<template>
  <article class="improve-your-agent">
    <Transition name="slide-fade">
      <section
        v-if="isImprovesOpen"
        class="improve-your-agent__content"
        :class="{ 'improve-your-agent__content--active': isImprovesOpen }"
      >
        <header class="content__header">
          <UnnnicIcon
            icon="auto_awesome"
            filled
            scheme="neutral-white"
            size="md"
          />
          <p class="header__title">{{ $t('home.improve_your_agent.title') }}</p>
        </header>

        <ol class="content__improves">
          <li
            v-for="(improve, index) in improves"
            :key="index"
          >
            <ItemCollapse
              :icon="improve.icon"
              :title="improve.title"
              :description="improve.description"
              :open="improveOpened === index"
              @update:open="improveOpened = $event ? index : null"
              @show-me="improve.trigger"
            />
          </li>
        </ol>

        <button class="content__dont-show">
          {{ $t('home.improve_your_agent.dont_show_me_again') }}
        </button>
      </section>
    </Transition>

    <button
      class="improve-your-agent__button"
      @click="toggleImproves"
    >
      <UnnnicIcon
        icon="auto_awesome"
        filled
        scheme="weni-500"
        size="avatar-nano"
      />
    </button>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';
import i18n from '../../utils/plugins/i18n';
import ItemCollapse from './ItemCollapse.vue';

const improveOpened = ref(0);

const improves = computed(() => {
  const contextTranslate = (value) =>
    i18n.global.t(`home.improve_your_agent.${value}`);

  return [
    {
      icon: 'storefront',
      title: contextTranslate('commerce_skills.title'),
      description: contextTranslate('commerce_skills.description'),
      trigger: () => {},
    },
    {
      icon: 'browse',
      title: contextTranslate('communication_channels.title'),
      description: contextTranslate('communication_channels.description'),
      trigger: () => {},
    },
    {
      icon: 'neurology',
      title: contextTranslate('personalization.title'),
      description: contextTranslate('personalization.description'),
      trigger: () => {},
    },
    {
      icon: 'monitoring',
      title: contextTranslate('track_performance.title'),
      description: contextTranslate('track_performance.description'),
      trigger: () => {},
    },
  ];
});

const isImprovesOpen = ref(false);
function toggleImproves() {
  isImprovesOpen.value = !isImprovesOpen.value;
}
</script>

<style lang="scss" scoped>
.improve-your-agent {
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
