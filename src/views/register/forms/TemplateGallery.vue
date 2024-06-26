<template>
  <UnnnicTab
    v-model="activeTab"
    :tabs="['template', 'blank']"
  >
    <template slot="tab-head-template">
      {{ $t('template_gallery.tabs.template.title') }}
    </template>

    <template slot="tab-panel-template">
      <div class="categories">
        <div class="categories__title">
          {{ $t('template_gallery.templates.categories') }}
        </div>

        <UnnnicTag
          :text="value"
          :class="[
            'category',
            `category--${clearString(value)}`,
            { 'category--selected': value === category },
          ]"
          clickable
          disabled
          v-for="value in categories"
          :key="value"
          @click="category === value ? (category = null) : (category = value)"
        ></UnnnicTag>
      </div>

      <div class="templates">
        <div
          v-for="(template, index) in templates"
          :key="index"
          :class="[
            'template',
            { 'template--active': selectedTemplate === template.uuid },
          ]"
          @click="templateDetails = template"
        >
          <img
            v-if="templateSetupThumbnail"
            class="template__image"
            :src="templateSetupThumbnail"
          />

          <img
            v-else
            class="template__image"
            src="../../../assets/tutorial/studio-video.gif"
          />

          <div class="template__title">
            {{ template.name }}
          </div>

          <div class="categories">
            <UnnnicTag
              :text="category"
              v-for="category in template.category"
              :key="category"
              :class="[
                'category',
                'category--selected',
                `category--${clearString(category)}`,
              ]"
              disabled
            ></UnnnicTag>
          </div>
        </div>
      </div>

      <UnnnicModal
        v-if="templateDetails"
        @close="templateDetails = null"
        class="template-details"
        :text="templateDetails.name"
      >
        <div class="template-details__container">
          <div class="template-details__aside">
            <div class="template-details__description">
              {{ templateDetails.description }}
            </div>

            <div class="categories">
              <UnnnicTag
                :text="category"
                v-for="category in templateDetails.category"
                :key="category"
                :class="[
                  'category',
                  'category--selected',
                  `category--${clearString(category)}`,
                ]"
                disabled
              ></UnnnicTag>
            </div>

            <div class="template-details__features">
              <div
                v-for="feature in templateDetails.features.slice(0, 4)"
                :key="feature.id"
                class="template-details__features__feature"
              >
                <UnnnicIcon
                  icon="check_circle"
                  size="sm"
                  scheme="aux-green-500"
                />

                {{
                  $t(
                    'projects.create.format.' +
                      {
                        Flows: 'flow_of',
                        Integrations: 'integration_of',
                        Intelligences: 'intelligence_of',
                      }[feature.type],
                    { name: feature.name },
                  )
                }}
              </div>

              <div v-if="templateDetails.features.length - 4 > 0">
                +{{ templateDetails.features.length - 4 }}
                {{ $t('template_gallery.templates.other_features') }}
              </div>
            </div>

            <div class="template-details__aside__footer">
              <InfoBox
                v-if="templateDetailsSetupWarning"
                :description="templateDetailsSetupWarning"
              />

              <UnnnicButton
                @click.prevent="
                  templateDetailsSetupFields
                    ? (templateSettings = templateDetails)
                    : (selectedTemplate = templateDetails.uuid);
                  templateDetails = null;
                "
                class="template-details__aside__footer__button"
              >
                {{ $t('template_gallery.templates.button_use_template') }}
              </UnnnicButton>
            </div>
          </div>

          <img
            v-if="templateDetailsSetupPreview"
            class="template-details__preview"
            :src="templateDetailsSetupPreview"
          />

          <img
            class="template-details__preview"
            src="../../../assets/example-template-preview.svg"
          />
        </div>
      </UnnnicModal>

      <UnnnicModal
        v-if="templateSettings"
        @close="templateSettings = null"
        :text="$t('template_gallery.templates.setup_template_title')"
        class="template-settings"
      >
        <div class="template-settings__container">
          <TemplateSetup
            form
            :template="templateSettings"
            @submit="setGlobals"
          />

          <template v-if="templateSettingsSetupObservation">
            <hr class="template-settings__separator" />

            <div
              class="template-settings__observation"
              v-html="templateSettingsSetupObservation"
            ></div>
          </template>
        </div>
      </UnnnicModal>
    </template>

    <template slot="tab-head-blank">
      {{ $t('template_gallery.tabs.blank.title') }}
    </template>

    <template slot="tab-panel-blank">
      <div class="templates">
        <div
          :class="[
            'template',
            { 'template--active': selectedTemplate === 'blank' },
          ]"
          @click="selectedTemplate = 'blank'"
        >
          <div class="template__image"></div>

          <div class="template__title">
            {{ $t('projects.create.format.blank2.title') }}
          </div>
        </div>
      </div>

      <UnnnicCollapse
        class="template-suggester"
        :title="$t('template_gallery.template_suggestion_input.title')"
        active
        size="md"
        unspacedIcon
      >
        <UnnnicFormElement
          :label="$t('template_gallery.template_suggestion_input.label')"
          size="md"
        >
          <div class="template-suggester__form-name">
            <UnnnicInput
              v-model="templateSuggestionName"
              :disabled="sentTemplateSuggestion"
              class="template-suggester__form-name__input"
            />

            <UnnnicButton
              :loading="sendingTemplateSuggestion"
              :disabled="sentTemplateSuggestion"
              @click.prevent="sendTemplateSuggestion"
              type="tertiary"
            >
              {{
                sentTemplateSuggestion
                  ? $t('template_gallery.template_suggestion_input.sent')
                  : $t('template_gallery.template_suggestion_input.send')
              }}
            </UnnnicButton>
          </div>
        </UnnnicFormElement>
      </UnnnicCollapse>
    </template>
  </UnnnicTab>
</template>

<script>
import { uniq } from 'lodash';
import projects from '../../../api/projects';
import InfoBox from '../../../components/billing/InfoBox.vue';
import TemplateSetup from '../../../views/projects/templates/setup.vue';

export default {
  props: {
    template: String,
  },

  components: {
    InfoBox,
    TemplateSetup,
  },

  data() {
    return {
      activeTab: 'template',

      // categories: ['recommended', 'trending', 'sales', 'support'],
      category: '',

      selectedTemplate: '',

      templateDetails: null,

      templateSettings: null,

      templateSuggestionName: '',
      sendingTemplateSuggestion: false,
      sentTemplateSuggestion: false,
    };
  },

  watch: {
    selectedTemplate() {
      this.$emit('update:template', this.selectedTemplate);
    },
  },

  async created() {
    if (this.$store.state.Project.templates.status === null) {
      this.$store.state.Project.templates.status = 'loading';

      const { data } = await projects.getTemplates();

      this.$store.state.Project.templates.status = 'loaded';
      this.$store.state.Project.templates.data = data.results;
    }
  },

  methods: {
    setGlobals(values) {
      this.$emit('set-globals', values);
      console.log(this.templateSettings);
      this.selectedTemplate = this.templateSettings.uuid;
      this.templateSettings = null;
    },

    clearString(string) {
      return string
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ /g, '_')
        .toLowerCase();
    },

    async sendTemplateSuggestion() {
      try {
        this.sendingTemplateSuggestion = true;

        await projects.createTemplateSuggestion({
          name: this.templateSuggestionName,
        });

        this.sentTemplateSuggestion = true;
      } finally {
        this.sendingTemplateSuggestion = false;
      }
    },
  },

  computed: {
    categories() {
      return uniq(
        this.$store.state.Project.templates.data
          .map(({ category }) => category)
          .flat(),
      );
    },

    templates() {
      let filtered = this.$store.state.Project.templates.data;

      console.log(this.category);

      if (this.category) {
        filtered = filtered.filter((template) =>
          template.category.includes(this.category),
        );
      }

      return filtered;
    },

    templateDetailsSetupPreview() {
      return this.templateDetails.setup?.preview;
    },
    templateDetailsSetupWarning() {
      return this.templateDetails.setup?.warning;
    },
    templateDetailsSetupFields() {
      return this.templateDetails.setup?.fields;
    },
    templateSetupThumbnail() {
      return this.template.setup?.thumbnail;
    },
    templateSettingsSetupObservation() {
      return this.templateSettings.setup?.observation;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.template-suggester {
  margin-top: $unnnic-spacing-sm;

  &__form-name {
    display: flex;
    column-gap: $unnnic-spacing-xs;

    &__input {
      flex: 1;
    }
  }
}

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
      'vendas' $unnnic-color-aux-purple-500,
      'suporte' $unnnic-color-aux-orange-500,
      'integracoes' $unnnic-color-aux-yellow-500;

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
      background-color: $unnnic-color-neutral-light;
    }

    &__title {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      color: $unnnic-color-neutral-dark;

      margin-top: $unnnic-spacing-sm;
    }

    &__title + .categories {
      margin-top: $unnnic-spacing-xs;
    }
  }
}

.template-details {
  @media screen and (min-width: 601px) {
    ::v-deep .unnnic-modal-container-background {
      width: 90%;
      max-width: 51.25rem;
    }
  }

  &__container {
    display: flex;
    column-gap: $unnnic-spacing-sm;
    text-align: left;

    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-dark;
  }

  &__description {
    margin-bottom: $unnnic-spacing-ant;
  }

  &__features {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-ant;
    margin: $unnnic-spacing-md 0;

    &__feature {
      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-xs;
    }
  }

  &__aside {
    display: flex;
    flex-direction: column;

    &__footer {
      margin-top: auto;

      &__button {
        margin-top: $unnnic-spacing-ant;
        width: 100%;
      }
    }
  }

  &__preview {
    max-width: 23.625rem;
    width: 48.9637306%;
  }
}

.template-settings {
  &__container {
    text-align: left;
  }

  &__button {
    width: 100%;
    margin-top: $unnnic-spacing-md;
  }

  &__separator {
    all: unset;
    display: block;
    border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-md 0;
  }

  &__observation {
    padding: $unnnic-spacing-xs $unnnic-spacing-ant;
    border-radius: $unnnic-border-radius-md;
    background-color: $unnnic-color-neutral-soft;
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-nano;

    :deep(p) {
      margin: 0;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      color: $unnnic-color-neutral-cloudy;
    }

    :deep(b),
    :deep(a) {
      font-weight: $unnnic-font-weight-bold;
    }

    :deep(a) {
      color: inherit;
      text-underline-offset: $unnnic-spacing-stack-nano;
    }
  }
}
</style>
