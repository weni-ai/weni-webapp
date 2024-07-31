<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :class="['container', `step-${step}`]">
    <template v-if="step === 'gallery'">
      <div class="header">
        <div class="title">
          <span class="u font secondary title-sm bold color-neutral-darkest">
            {{ $t('projects.create.format.gallery.title') }}
          </span>

          <UnnnicIcon
            icon="close-1"
            size="sm"
            clickable
            @click="$emit('close')"
          />
        </div>

        <UnnnicInputNext
          v-model="search"
          size="sm"
          iconLeft="search-1"
          :placeholder="$t('projects.create.format.gallery.search_placeholder')"
        />
      </div>

      <div class="sidebar">
        <div class="u font secondary body-gt bold color-neutral-darkest">
          {{ $t('projects.create.format.categories.filter') }}
        </div>

        <div
          :class="[
            'u font secondary body-md color-neutral-cloudy option',
            { bold: filterCategory === '' },
          ]"
          @click="filterCategory = ''"
        >
          {{ $t('projects.create.format.categories.all') }}
        </div>

        <div
          v-for="option in ['Vendas', 'Suporte']"
          :key="option"
          :class="[
            'u font secondary body-md color-neutral-cloudy option',
            { bold: filterCategory === option },
          ]"
          @click="filterCategory = option"
        >
          {{ option }}
        </div>

        <div
          class="integrations option"
          @click="isIntegrationsTopicOpen = !isIntegrationsTopicOpen"
        >
          <div class="u font secondary body-md color-neutral-cloudy">
            {{ $t('projects.create.format.categories.integrations') }}
          </div>

          <UnnnicIcon
            scheme="neutral-cleanest"
            :icon="`arrow-button-${isIntegrationsTopicOpen ? 'up' : 'down'}-1`"
            size="xs"
          />
        </div>

        <template v-if="isIntegrationsTopicOpen">
          <div
            @click="filterCategory = 'Integrações--omie'"
            :class="[
              'u font secondary body-md color-neutral-cloudy sub-1 option',
              { bold: filterCategory === 'Integrações--omie' },
            ]"
          >
            Omie
          </div>
        </template>
      </div>

      <div class="content">
        <div
          class="template"
          v-for="template in templates"
          :key="template.uuid"
          @click="
            $emit('update:selected-template', template);
            $emit('input', 'info');
          "
        >
          <div class="template__title">
            <span class="u font secondary body-gt bold color-neutral-darkest">
              {{ template.name }}
            </span>
          </div>
          <div class="template__description">
            <p>
              {{ template.description }}
            </p>
          </div>
          <div class="template__indicators">
            <UnnnicTag
              class="category"
              scheme="aux-baby-blue"
              :text="category"
              v-for="category in template.category"
              :key="category"
              type="default"
            ></UnnnicTag>
          </div>
        </div>

        <div
          class="blank"
          @click="$emit('change', { value: 'blank' })"
        >
          <UnnnicIcon
            scheme="neutral-clean"
            icon="add"
            size="xl"
          />

          <div class="u font secondary body-md color-neutral-cloudy">
            {{ $t('projects.create.format.blank.title') }}
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="['info', 'setup'].includes(step)">
      <div class="navigation">
        <div
          class="back"
          @click="$emit('input', { info: 'gallery', setup: 'info' }[step])"
        >
          <UnnnicIcon
            scheme="neutral-cloudy"
            icon="keyboard_backspace"
            size="ant"
          />

          <span class="u font secondary body-md color-neutral-cloudy">
            {{ $t('back') }}
          </span>
        </div>

        <UnnnicIcon
          icon="close-1"
          size="sm"
          clickable
          @click="$emit('close')"
        />
      </div>

      <div class="content">
        <div class="info-container">
          <Info
            v-if="step === 'info'"
            @input="$emit('input', $event)"
            @use="change"
            :template="selectedTemplate"
          />

          <Setup
            v-else-if="step === 'setup'"
            :template="selectedTemplate"
            @submit="change"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Info from './info.vue';
import Setup from './setup.vue';

export default {
  model: {
    prop: 'step',
  },

  components: {
    Info,
    Setup,
  },

  props: {
    step: {
      type: String,
      default: 'gallery',
    },

    selectedTemplate: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  data() {
    return {
      search: '',
      isIntegrationsTopicOpen: false,
      filterCategory: '',
    };
  },

  computed: {
    templates() {
      let filtered = this.$store.state.Project.templates.data;

      if (this.search) {
        filtered = filtered.filter((template) =>
          template.name.toLowerCase().includes(this.search.toLowerCase()),
        );
      }

      if (this.filterCategory) {
        filtered = filtered.filter((template) =>
          template.category.includes(this.filterCategory.split('--')[0]),
        );
      }

      return filtered;
    },
  },

  methods: {
    change(value) {
      this.$emit('change', { value: this.selectedTemplate.uuid, setup: value });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  max-width: 63.125rem;
  min-height: Min(90vh, 39.75rem);
  margin: 0 auto;
  padding: $unnnic-inline-md;
  display: grid;
  overflow: auto;

  &.step-gallery {
    grid-template-columns: 13.9375rem 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'header header'
      'sidebar content';

    column-gap: $unnnic-spacing-inline-sm;
    row-gap: $unnnic-spacing-stack-md;

    .content {
      gap: $unnnic-spacing-stack-sm $unnnic-spacing-inline-sm;

      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
      grid-template-rows: max-content;
      grid-auto-rows: 1fr;

      .template {
        cursor: pointer;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
        border-radius: 8px;
        padding: $unnnic-spacing-inset-sm;
        background-color: $unnnic-color-background-snow;
        display: flex;
        flex-direction: column;
        row-gap: 0.75rem;

        &__title {
          display: flex;
          justify-content: space-between;
          column-gap: $unnnic-spacing-inline-sm;
          align-items: center;
          height: ($unnnic-font-size-body-gt + $unnnic-line-height-md) * 2;

          .u.font {
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            display: -webkit-box;
          }
        }

        &__description {
          flex: 1;
          font-size: $unnnic-font-size-body-md;
          color: $unnnic-color-neutral-cloudy;
          line-height: 20px;

          p {
            margin: 0;
          }
        }

        &__indicators {
          width: fit-content;
          margin-top: $unnnic-font-size-body-md + $unnnic-line-height-md;
        }
      }

      .blank {
        user-select: none;
        cursor: pointer;
        padding: $unnnic-spacing-inset-md;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
        border-radius: $unnnic-border-radius-md;
        box-sizing: border-box;
        row-gap: $unnnic-spacing-stack-xs;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: $unnnic-color-background-snow;
      }
    }
  }

  &.step-info,
  &.step-setup {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'navigation'
      'content';

    column-gap: $unnnic-spacing-inline-sm;
    row-gap: $unnnic-spacing-stack-md;

    .navigation {
      display: flex;
      column-gap: $unnnic-spacing-inline-sm;
      justify-content: space-between;
      align-items: center;

      .back {
        display: flex;
        column-gap: $unnnic-spacing-inline-xs;
        cursor: pointer;
      }
    }

    .content .info-container {
      padding: $unnnic-spacing-inset-md;
      background-color: $unnnic-color-background-snow;
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-md;
    }
  }
}

.header {
  grid-area: header;
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-stack-md;

  .title {
    display: flex;
    text-align: center;
    column-gap: $unnnic-spacing-inline-sm;
    align-items: center;

    .u.font {
      flex: 1;
      display: block;
    }
  }
}

.sidebar {
  grid-area: sidebar;

  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-inset-sm;
  height: fit-content;
  display: flex;
  flex-direction: column;
  row-gap: 0.75rem;

  .option {
    display: flex;
    column-gap: $unnnic-spacing-inline-xs;
    align-items: center;
    cursor: pointer;

    &.sub-1 {
      margin-left: $unnnic-spacing-inline-sm;
    }
  }
}

.content {
  grid-area: content;

  $scroll-size: $unnnic-inline-nano;

  flex: 1;
  overflow: overlay;

  padding-right: calc(#{$unnnic-inline-xs} + #{$scroll-size});
  width: 100%;

  &::-webkit-scrollbar {
    width: $scroll-size;
  }

  &::-webkit-scrollbar-thumb {
    background: $unnnic-color-neutral-clean;
    border-radius: $unnnic-border-radius-pill;
  }

  &::-webkit-scrollbar-track {
    background: $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-pill;
  }
}
</style>
