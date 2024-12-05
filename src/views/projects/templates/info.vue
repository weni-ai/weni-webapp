<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <header>
      <div class="about">
        <div class="unnnic-font secondary title-sm bold color-neutral-darkest">
          {{ template.name }}
        </div>

        <div class="unnnic-font secondary body-md color-neutral-cloudy">
          {{ template.description }}
        </div>

        <div class="indicators">
          <UnnnicTag
            v-for="category in template.category"
            :key="category"
            class="category"
            scheme="aux-baby-blue"
            :text="category"
            type="default"
          ></UnnnicTag>

          <div class="unnnic-font secondary body-md color-neutral-darkest">
            {{
              $t(`projects.create.format.pages.info.levels.${template.level}`)
            }}

            <UnnnicIcon
              icon="indicator"
              :scheme="
                ['low', 'medium', 'high'].includes(template.level)
                  ? 'aux-blue'
                  : 'neutral-clean'
              "
              size="sm"
            ></UnnnicIcon>

            <UnnnicIcon
              icon="indicator"
              :scheme="
                ['medium', 'high'].includes(template.level)
                  ? 'aux-blue'
                  : 'neutral-clean'
              "
              size="sm"
            ></UnnnicIcon>

            <UnnnicIcon
              icon="indicator"
              :scheme="
                ['high'].includes(template.level) ? 'aux-blue' : 'neutral-clean'
              "
              size="sm"
            ></UnnnicIcon>
          </div>
        </div>
      </div>

      <div class="button-container">
        <UnnnicButton
          type="secondary"
          @click="clickButtonContainer"
        >
          {{ $t('projects.create.format.use') }}
        </UnnnicButton>
      </div>
    </header>

    <div class="separator"></div>

    <main>
      <div
        class="main__title unnnic-font secondary body-gt bold color-neutral-darkest"
      >
        {{ $t('projects.create.format.included_features') }}
      </div>

      <div class="features">
        <div
          v-for="feature in template.features"
          :key="feature.id"
          class="feature"
        >
          <div class="feature__header">
            <UnnnicAvatarIcon
              v-if="feature.type === 'Flows'"
              size="xs"
              icon="account_tree"
              scheme="aux-purple"
            />

            <UnnnicAvatarIcon
              v-else-if="feature.type === 'Integrations'"
              size="xs"
              icon="browse"
              scheme="aux-blue"
            />

            <UnnnicAvatarIcon
              v-else-if="feature.type === 'Intelligences'"
              size="xs"
              icon="neurology"
              scheme="feedback-blue"
            />

            <div
              class="unnnic-font secondary body-md bold color-neutral-cloudy"
            >
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
          </div>

          <div class="unnnic-font secondary body-md color-neutral-cloudy">
            {{ feature.description }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  props: {
    template: Object,
  },

  methods: {
    clickButtonContainer() {
      this.template.setup?.fields
        ? this.$emit('update:model-value', 'setup')
        : this.$emit('use');
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  display: flex;
  align-items: center;
  column-gap: 10%;
  justify-content: space-between;

  .about {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-stack-sm;

    .indicators {
      display: flex;
      column-gap: $unnnic-spacing-inline-md;
      align-items: center;

      .category {
        display: inline-flex;
      }
    }
  }

  .button-container {
    min-width: 17rem;

    button {
      width: 100%;
    }
  }
}

.separator {
  width: 100%;
  height: $unnnic-border-width-thinner;
  background-color: $unnnic-color-neutral-soft;
  margin: $unnnic-spacing-stack-lg 0;
}

main {
  .main__title {
    margin-bottom: $unnnic-spacing-stack-md;
  }

  .features {
    display: grid;
    gap: $unnnic-spacing-stack-lg $unnnic-spacing-inline-lg;
    grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));

    .feature__header {
      display: flex;
      align-items: center;
      column-gap: 0.75rem;
      margin-bottom: $unnnic-spacing-stack-xs;
    }
  }
}
</style>
