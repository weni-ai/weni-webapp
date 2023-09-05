<template>
  <unnnic-tab v-model="activeTab" :tabs="['template', 'blank']">
    <template slot="tab-head-template">
      {{ $t('template_gallery.tabs.template.title') }}
    </template>

    <template slot="tab-panel-template">
      <div class="categories">
        <div class="categories__title">Categorias:</div>

        <unnnic-tag
          :text="value"
          :class="[
            'category',
            `category--${value}`,
            { 'category--selected': value === category },
          ]"
          clickable
          disabled
          v-for="value in categories"
          :key="value"
          @click="category = value"
        ></unnnic-tag>
      </div>

      <div class="templates">
        <div
          v-for="({ title, categories }, index) in templates.filter(
            (template) => template.categories.includes(category),
          )"
          :key="index"
          :class="['template', { 'template--active': template === title }]"
          @click="template = title"
        >
          <img
            class="template__image"
            src="../../../assets/tutorial/studio-video.gif"
          />

          <div class="template__title">{{ title }}</div>

          <div class="categories">
            <unnnic-tag
              v-for="value in categories"
              :key="value"
              :text="value"
              :class="['category', 'category--selected', `category--${value}`]"
              disabled
            ></unnnic-tag>
          </div>
        </div>
      </div>
    </template>

    <template slot="tab-head-blank">
      {{ $t('template_gallery.tabs.blank.title') }}
    </template>

    <template slot="tab-panel-blank"></template>
  </unnnic-tab>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'template',

      categories: ['recommended', 'trending', 'sales', 'support'],
      category: 'recommended',

      templates: [
        {
          title: 'Captura de Leads',
          categories: ['recommended', 'sales'],
        },
        {
          title: 'Captura de Leads com ChatGPT',
          categories: ['recommended', 'support'],
        },
        {
          title: 'Captura de Leads com Omie',
          categories: ['recommended', 'sales'],
        },
      ],

      template: '',
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.categories {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-xs;
  flex-wrap: wrap;

  &__title {
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    color: $unnnic-color-neutral-dark;
  }

  .category {
    user-select: none;

    $category-colors: 'recommended' $unnnic-color-aux-blue-500,
      'sales' $unnnic-color-aux-purple-500,
      'support' $unnnic-color-aux-orange-500,
      'trending' $unnnic-color-aux-yellow-500;

    @each $name, $color in $category-colors {
      &--#{$name}.category--selected {
        background-color: rgba($color, $unnnic-opacity-level-extra-light);

        ::v-deep .unnnic-tag__label {
          color: $color;
        }
      }
    }
  }
}

.templates {
  display: grid;
  grid-gap: $unnnic-spacing-sm;
  grid-template-columns: repeat(auto-fill, minmax(15.3125rem, 1fr));
  margin-top: $unnnic-spacing-sm;

  .template {
    display: flex;
    flex-direction: column;
    border-radius: $unnnic-border-radius-md;
    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;
    padding: $unnnic-spacing-sm;
    cursor: pointer;
    user-select: none;

    &--active {
      outline-color: $unnnic-color-weni-600;
      background-color: $unnnic-color-weni-50;
    }

    &__image {
      aspect-ratio: 245 / 100;
      object-fit: cover;
      border-radius: $unnnic-border-radius-sm;
    }

    &__title {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      color: $unnnic-color-neutral-dark;

      margin-top: $unnnic-spacing-sm;
      margin-bottom: $unnnic-spacing-xs;
    }
  }
}
</style>
