<template>
  <div>
    <header>
      <div class="about">
        <div class="unnnic-font secondary title-sm bold color-neutral-darkest">
          {{ $t(`projects.create.format.${template.name}.title`) }}
        </div>

        <div class="unnnic-font secondary body-md color-neutral-cloudy">
          {{ $t(`projects.create.format.${template.name}.description`) }}
        </div>

        <div class="indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            :text="$t(`projects.create.format.categories.${template.category}`)"
            type="default"
          ></unnnic-tag>

          <div class="unnnic-font secondary body-md color-neutral-darkest">
            {{
              $t(`projects.create.format.pages.info.levels.${template.level}`)
            }}

            <unnnic-icon
              icon="indicator"
              :scheme="
                ['low', 'medium', 'high'].includes(template.level)
                  ? 'aux-blue'
                  : 'neutral-clean'
              "
              size="sm"
            ></unnnic-icon>

            <unnnic-icon
              icon="indicator"
              :scheme="
                ['medium', 'high'].includes(template.level)
                  ? 'aux-blue'
                  : 'neutral-clean'
              "
              size="sm"
            ></unnnic-icon>

            <unnnic-icon
              icon="indicator"
              :scheme="
                ['high'].includes(template.level) ? 'aux-blue' : 'neutral-clean'
              "
              size="sm"
            ></unnnic-icon>
          </div>
        </div>
      </div>

      <div class="button-container">
        <unnnic-button
          type="secondary"
          @click="template.setup ? $emit('input', 'setup') : $emit('use')"
        >
          {{ $t('projects.create.format.use') }}
        </unnnic-button>
      </div>
    </header>

    <div class="separator"></div>

    <main>
      <div
        class="
          main__title
          unnnic-font
          secondary
          body-gt
          bold
          color-neutral-darkest
        "
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
            <unnnic-avatar-icon
              v-if="feature.type === 'Flows'"
              size="xs"
              icon="hierarchy-3-2"
              scheme="aux-purple"
            />

            <unnnic-avatar-icon
              v-else-if="feature.type === 'Integrations'"
              size="xs"
              icon="layout-dashboard-1"
              scheme="aux-blue"
            />

            <unnnic-avatar-icon
              v-else-if="feature.type === 'Intelligences'"
              size="xs"
              icon="science-fiction-robot-2"
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
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
