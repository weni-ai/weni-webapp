<template>
  <section class="resources">
    <component
      v-bind="propsByResource(resource)"
      v-for="(resource, index) in resources"
      :key="index"
      :is="resource.route ? 'RouterLink' : 'a'"
      class="resource"
      :class="[`resource--${resource.id}`]"
      :data-test="resource.id"
      @click="handleNativeClick(resource)"
    >
      <section class="resource__icon__container">
        <UnnnicIcon
          :icon="resource.icon"
          scheme="inherit"
          class="resource__icon"
        />
      </section>

      <section class="resource__content">
        <h3>{{ resource.label }}</h3>

        <p>{{ resource.description }}</p>
      </section>
    </component>
  </section>
</template>

<script>
export default { name: 'LearningCenterResources' };
</script>

<script setup>
import { computed } from 'vue';
import i18n from '../../../utils/plugins/i18n';

const emits = defineEmits(['redirected']);

function propsByResource(resource) {
  if (resource.route) {
    return {
      to: resource.route,
    };
  }

  return {
    href: resource.externalLink,
    target: '_blank',
  };
}

function handleNativeClick(resource) {
  if (resource.route) {
    emits('redirected');
  }
}

const resources = computed(() => [
  {
    id: 'academy',
    icon: 'smart_display',
    label: 'Academy',
    description: i18n.global.t('NAVBAR.LEARN.WENI_ACADEMY'),
    route: {
      name: 'academy',
      params: {
        internal: ['init'],
      },
    },
  },
  {
    id: 'docs',
    icon: 'article',
    label: 'Docs',
    description: i18n.global.t('NAVBAR.LEARN.WENI_DOCS'),
    externalLink: 'https://docs.weni.ai/',
  },
  {
    id: 'community',
    icon: 'group',
    label: i18n.global.t('weni_community.title'),
    description: i18n.global.t('weni_community.description'),
    externalLink: 'https://comunidade.weni.ai/',
  },
  {
    id: 'apis',
    icon: 'power',
    label: "API's",
    description: i18n.global.t('NAVBAR.LEARN.weni_APIs'),
    route: {
      name: 'apiFlows',
      params: {
        internal: ['init'],
      },
    },
  },
]);
</script>

<style lang="scss" scoped>
.resources {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-sm;

  .resource {
    text-decoration: none;
    display: flex;
    column-gap: $unnnic-spacing-ant;
    align-items: center;

    &__icon {
      $icon-size: 4.125 * $unnnic-font-size;

      font-size: 1.75 * $unnnic-font-size;

      &__container {
        user-select: none;

        display: flex;
        width: $icon-size;
        height: $icon-size;
        border-radius: $unnnic-border-radius-sm;
        align-items: center;
        justify-content: center;
      }
    }

    &__content {
      flex: 1;

      h3,
      p {
        margin: 0;

        color: $unnnic-color-neutral-dark;
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      }

      h3 {
        font-weight: $unnnic-font-weight-bold;
      }
    }

    &:hover {
      h3,
      p {
        color: $unnnic-color-neutral-darkest;
      }
    }

    &--academy {
      .resource__icon__container {
        color: $unnnic-color-aux-purple-500;
        background: $unnnic-color-aux-purple-100;
      }
    }

    &--docs {
      .resource__icon__container {
        color: $unnnic-color-aux-blue-500;
        background: $unnnic-color-aux-blue-100;
      }
    }

    &--community {
      .resource__icon__container {
        color: $unnnic-color-aux-green-500;
        background: $unnnic-color-aux-green-100;
      }
    }

    &--apis {
      .resource__icon__container {
        color: $unnnic-color-aux-orange-500;
        background: $unnnic-color-aux-orange-100;
      }
    }
  }
}
</style>
