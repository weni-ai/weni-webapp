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
          v-for="({ title, categories, details }, index) in templates.filter(
            (template) => template.categories.includes(category),
          )"
          :key="index"
          :class="['template', { 'template--active': template === title }]"
          @click="details ? (templateDetails = details) : (template = title)"
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

      <unnnic-modal
        v-if="templateDetails"
        @close="templateDetails = null"
        class="template-details"
        :text="templateDetails.title"
      >
        <div class="template-details__container">
          <div class="template-details__aside">
            <div class="template-details__description">
              {{ templateDetails.description }}
            </div>

            <div class="categories">
              <unnnic-tag
                v-for="value in templateDetails.categories"
                :key="value"
                :text="value"
                :class="[
                  'category',
                  'category--selected',
                  `category--${value}`,
                ]"
                disabled
              ></unnnic-tag>
            </div>

            <div class="template-details__features">
              <div
                v-for="feature in templateDetails.features"
                :key="feature"
                class="template-details__features__feature"
              >
                <unnnic-icon
                  icon="check-circle-1-1-1"
                  size="sm"
                  scheme="aux-green-500"
                />

                {{ feature }}
              </div>

              <div>
                +{{ templateDetails.countOtherFeatures }} outros recursos
              </div>
            </div>

            <div class="template-details__aside__footer">
              <div class="template-details__aside__footer__warning">
                <unnnic-icon
                  icon="alert-circle-1-1"
                  size="sm"
                  scheme="aux-yellow-300"
                />

                Esse template necessita de um Token do ChatGPT
              </div>

              <unnnic-button
                @click.prevent="
                  templateDetails.settings
                    ? (templateSettings = templateDetails.settings)
                    : (template = templateDetails.id);
                  templateDetails = null;
                "
                class="template-details__aside__footer__button"
              >
                Usar template
              </unnnic-button>
            </div>
          </div>

          <img
            class="template-details__preview"
            src="../../../assets/example-template-preview.svg"
          />
        </div>
      </unnnic-modal>

      <unnnic-modal
        v-if="templateSettings"
        @close="templateSettings = null"
        text="Configurar template"
        class="template-settings"
      >
        <div class="template-settings__container">
          <unnnic-form-element
            v-for="formElement in templateSettings.settings"
            :key="formElement.label"
            :label="formElement.label"
          >
            <unnnic-input />
          </unnnic-form-element>

          <unnnic-button
            @click.prevent="
              template = templateSettings.id;
              templateSettings = null;
            "
            class="template-settings__button"
          >
            Concluir
          </unnnic-button>

          <hr class="template-settings__separator" />

          <div class="template-settings__observation">
            <div class="template-settings__observation__title">
              {{ templateSettings.observation.title }}
            </div>

            <div class="template-settings__observation__description">
              {{ templateSettings.observation.description }}
            </div>
          </div>
        </div>
      </unnnic-modal>
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
          details: {
            id: 'Captura de Leads com ChatGPT',
            title: 'Captura de Leads com ChatGPT',
            description:
              'Fluxo de mensagens integrado ao WhatsApp Demo e ao ChatGPT para capturar os dados dos seus clientes.',
            categories: ['recommended', 'support'],
            features: [
              'Integração com ChatGPT',
              'Fluxo de coleta de dados',
              'Fluxo de coleta de nome',
              'Fluxo de coleta de telefone',
            ],
            countOtherFeatures: 3,
            settings: {
              id: 'Captura de Leads com ChatGPT',
              observation: {
                title: 'Como obter um token?',
                description:
                  'Para obter um token do ChatGPT, você precisa se inscrever na API da OpenAI, obter credenciais e usar uma solicitação HTTP com essas credenciais para autenticação. O token permite que você interaja com o modelo ChatGPT por meio da API.',
              },
              settings: [
                {
                  label: 'Token do ChatGPT',
                },
              ],
            },
          },
        },
        {
          title: 'Captura de Leads com Omie',
          categories: ['recommended', 'sales'],
        },
      ],

      template: '',

      templateDetails: null,

      templateSettings: null,
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

      &__warning {
        display: flex;
        align-items: center;
        column-gap: $unnnic-spacing-xs;
        padding: $unnnic-spacing-xs $unnnic-spacing-ant;
        border-radius: $unnnic-border-radius-sm;
        outline-style: solid;
        outline-color: $unnnic-color-aux-yellow-300;
        outline-width: $unnnic-border-width-thinner;
        outline-offset: -$unnnic-border-width-thinner;

        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
        color: $unnnic-color-neutral-dark;

        background-color: rgba(
          $unnnic-color-aux-yellow-300,
          $unnnic-opacity-level-extra-light
        );
      }

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

    &__title,
    &__description {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      color: $unnnic-color-neutral-cloudy;
    }

    &__title {
      font-weight: $unnnic-font-weight-bold;
    }
  }
}
</style>
