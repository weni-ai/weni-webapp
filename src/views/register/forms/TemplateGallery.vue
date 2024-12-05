<template>
  <UnnnicTab
    v-model:activeTab="activeTab"
    :tabs="['blank', 'template']"
    @change="activeTab = $event"
  >
    <template #tab-head-template>
      {{ $t('template_gallery.tabs.template.title') }}
    </template>

    <template #tab-panel-template>
      <div class="categories">
        <div class="categories__title">
          {{ $t('template_gallery.templates.categories') }}
        </div>

        <UnnnicTag
          v-for="value in categories"
          :key="value"
          :text="value"
          :class="[
            'category',
            `category--${clearString(categoriesMap[value] || '')}`,
            { 'category--selected': value === category },
          ]"
          clickable
          disabled
          @click="category === value ? (category = null) : (category = value)"
        />
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
              v-for="category in template.category"
              :key="category"
              :text="category"
              :class="[
                'category',
                'category--selected',
                `category--${clearString(categoriesMap[category] || '')}`,
              ]"
              disabled
            ></UnnnicTag>
          </div>
        </div>
      </div>

      <DescriptionTextarea
        class="project-description-textarea"
        :modelValue="projectDescription"
        @update:model-value="$emit('update:projectDescription', $event)"
      />

      <UnnnicModal
        v-if="templateDetails"
        class="template-details"
        :text="templateDetails.name"
        @close="templateDetails = null"
      >
        <div class="template-details__container">
          <div class="template-details__aside">
            <div class="template-details__description">
              {{ templateDetails.description }}
            </div>

            <div class="categories">
              <UnnnicTag
                v-for="category in templateDetails.category"
                :key="category"
                :text="category"
                :class="[
                  'category',
                  'category--selected',
                  `category--${clearString(categoriesMap[category] || '')}`,
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
                class="template-details__aside__footer__button"
                @click.prevent="
                  templateDetailsSetupFields
                    ? (templateSettings = templateDetails)
                    : (selectedTemplate = templateDetails.uuid);
                  templateDetails = null;
                "
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
        </div>
      </UnnnicModal>

      <UnnnicModal
        v-if="templateSettings"
        :text="$t('template_gallery.templates.setup_template_title')"
        class="template-settings"
        @close="templateSettings = null"
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

    <template #tab-head-blank>
      {{ $t('template_gallery.tabs.blank.title') }}
    </template>

    <template #tab-panel-blank>
      <p class="agent-help-text">
        {{ $t('template_gallery.tabs.blank.help_text') }}
      </p>

      <UnnnicFormElement
        class="form-element"
        :label="$t('custom_agent.fields.name.label')"
      >
        <UnnnicInput
          v-model="$store.state.Brain.name"
          :placeholder="$t('custom_agent.fields.name.placeholder')"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        class="form-element"
        :label="$t('custom_agent.fields.goal.label')"
      >
        <UnnnicTextArea
          v-model="$store.state.Brain.goal"
          class="field-goal"
          size="md"
          :placeholder="$t('custom_agent.fields.goal.placeholder')"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        class="form-element"
        :label="$t('custom_agent.fields.content.label')"
      >
        <section class="field-content">
          <button
            v-if="amountContentsAdded"
            class="button-trigger"
            type="button"
            @click.prevent="showModalAddContent = true"
          >
            {{
              $t(
                'custom_agent.add_content.n_contents_added',
                amountContentsAdded,
              )
            }}

            <a>
              {{ $t('custom_agent.add_content.click_to_view_or_edit') }}
            </a>
          </button>

          <UnnnicButton
            v-else
            type="tertiary"
            size="small"
            iconLeft="add-1"
            @click.prevent="showModalAddContent = true"
          >
            {{ $t('custom_agent.add_content.action_text') }}
          </UnnnicButton>
        </section>
      </UnnnicFormElement>

      <ModalAddContent
        v-if="showModalAddContent"
        @close="showModalAddContent = false"
        @click.prevent
      />
    </template>
  </UnnnicTab>
</template>

<script>
import { uniq } from 'lodash';
import projects from '../../../api/projects';
import InfoBox from '../../../components/billing/InfoBox.vue';
import TemplateSetup from '../../../views/projects/templates/setup.vue';
import ModalAddContent from './ModalAddContent.vue';
import DescriptionTextarea from '../../projects/form/DescriptionTextarea.vue';
import { mapState } from 'vuex';

export default {
  components: {
    InfoBox,
    TemplateSetup,
    ModalAddContent,
    DescriptionTextarea,
  },
  props: {
    template: String,
    projectDescription: String,
  },

  data() {
    return {
      activeTab: 'blank',

      // categories: ['recommended', 'trending', 'sales', 'support'],
      category: '',

      selectedTemplate: '',

      templateDetails: null,

      templateSettings: null,

      templateSuggestionName: '',
      sendingTemplateSuggestion: false,
      sentTemplateSuggestion: false,

      showModalAddContent: false,
    };
  },

  computed: {
    ...mapState({
      profile: (state) => state.Account.profile,
    }),
    isValid() {
      if (this.activeTab === 'blank') {
        const { name, goal } = this.$store.state.Brain;

        return !!(name && goal);
      } else if (this.activeTab === 'template') {
        return !!this.selectedTemplate && this.projectDescription;
      }

      return true;
    },

    amountContentsAdded() {
      let amount = 0;

      if (this.$store.state.Brain.content.text) {
        amount++;
      }

      amount += this.$store.state.Brain.content.files.length;
      amount += this.$store.state.Brain.content.sites.length;

      return amount;
    },

    categories() {
      return uniq(
        this.$store.state.Project.templates.data
          .map(({ category }) => category)
          .flat(),
      );
    },

    categoriesMap() {
      return {
        [this.$t('projects.create.format.categories.sales')]: 'sales',
        [this.$t('projects.create.format.categories.support')]: 'support',
        [this.$t('projects.create.format.categories.integrations')]:
          'integrations',
      };
    },

    templates() {
      let filtered = this.$store.state.Project.templates.data;

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

  watch: {
    selectedTemplate() {
      this.$emit('update:template', this.selectedTemplate);
    },

    activeTab() {
      if (this.activeTab === 'template') {
        this.$emit('update:template', this.selectedTemplate);
      } else {
        this.$emit('update:template', '');
      }
    },

    isValid: {
      immediate: true,

      handler() {
        this.$emit('update:is-valid', this.isValid);
      },
    },
    'profile.language': {
      immediate: true,
      handler(newLang, oldLang) {
        if (newLang !== oldLang) this.getTemplates();
      },
    },
  },

  methods: {
    async getTemplates() {
      const { data } = await projects.getTemplates();
      this.$store.state.Project.templates.data = data.results;
    },
    setGlobals(values) {
      this.$emit('set-globals', values);
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
};
</script>

<style lang="scss" scoped>
.agent-help-text {
  margin: 0;
  margin-bottom: $unnnic-spacing-sm;

  color: $unnnic-color-neutral-cloudy;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
}

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

    $category-colors:
      'recommended' $unnnic-color-aux-blue-500,
      'sales' $unnnic-color-aux-purple-500,
      'support' $unnnic-color-aux-orange-500,
      'integrations' $unnnic-color-aux-yellow-500;

    @each $name, $color in $category-colors {
      &--#{$name}.category--selected {
        background-color: rgba($color, $unnnic-opacity-level-extra-light);

        :deep(.unnnic-tag__label) {
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

.project-description-textarea {
  margin-top: $unnnic-spacing-sm;
}

.template-details {
  @media screen and (min-width: 601px) {
    :deep(.unnnic-modal-container-background) {
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

.form-element + .form-element {
  margin-top: $unnnic-spacing-sm;
}

.field-goal :deep(textarea) {
  min-height: 6 * $unnnic-font-size;
}

.field-content {
  display: flex;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;
  padding: $unnnic-spacing-ant - $unnnic-border-width-thinner;

  > * {
    flex: 1;
  }

  .button-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border: 0;
    background-color: $unnnic-color-weni-50;
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;

    color: $unnnic-color-weni-600;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;

    a {
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;

      text-decoration: underline;
      text-underline-offset: $unnnic-spacing-stack-nano;
    }
  }
}
</style>
