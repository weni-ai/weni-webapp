<template>
  <div>
    <header>
      <div class="about">
        <div class="unnnic-font secondary title-sm bold color-neutral-darkest">
          Captura de Leads
        </div>

        <div class="unnnic-font secondary body-md color-neutral-cloudy">
          Utilize um modelo pronto de fluxo de mensagens, integrado ao Whatsapp
          Demo, para capturar dados de seus clientes.
        </div>

        <div class="indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            text="Vendas"
            type="default"
          ></unnnic-tag>

          <div class="unnnic-font secondary body-md color-neutral-darkest">
            Nível intermediário

            <unnnic-icon
              icon="indicator"
              scheme="aux-blue"
              size="sm"
            ></unnnic-icon>

            <unnnic-icon
              icon="indicator"
              scheme="aux-blue"
              size="sm"
            ></unnnic-icon>

            <unnnic-icon
              icon="indicator"
              scheme="neutral-clean"
              size="sm"
            ></unnnic-icon>
          </div>
        </div>
      </div>

      <div class="button-container">
        <unnnic-button
          type="secondary"
          icon-left="check-circle-1-1"
          @click="$emit('use')"
        >
          Utilizar template
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
        Esse template inclui:
      </div>

      <div class="features">
        <div v-for="i in 3" :key="'flows-' + i" class="feature">
          <div class="feature__header">
            <unnnic-avatar-icon
              size="xs"
              icon="hierarchy-3-2"
              scheme="aux-purple"
            />

            <div
              class="unnnic-font secondary body-md bold color-neutral-cloudy"
            >
              Fluxo de coleta de dados
            </div>
          </div>

          <div class="unnnic-font secondary body-md color-neutral-cloudy">
            Lorem ipsum dolor sit amet, consectetur adipiscing sed do eiusmod
            tempor incididunt ut labore et dolore
          </div>
        </div>

        <div v-for="i in 3" :key="'integrations-' + i" class="feature">
          <div class="feature__header">
            <unnnic-avatar-icon
              size="xs"
              icon="layout-dashboard-1"
              scheme="aux-blue"
            />

            <div
              class="unnnic-font secondary body-md bold color-neutral-cloudy"
            >
              Fluxo de coleta de dados
            </div>
          </div>

          <div class="unnnic-font secondary body-md color-neutral-cloudy">
            Lorem ipsum dolor sit amet, consectetur adipiscing sed do eiusmod
            tempor incididunt ut labore et dolore
          </div>
        </div>

        <div v-for="i in 3" :key="'intelligences-' + i" class="feature">
          <div class="feature__header">
            <unnnic-avatar-icon
              size="xs"
              icon="science-fiction-robot-2"
              scheme="feedback-blue"
            />

            <div
              class="unnnic-font secondary body-md bold color-neutral-cloudy"
            >
              Fluxo de coleta de dados
            </div>
          </div>

          <div class="unnnic-font secondary body-md color-neutral-cloudy">
            Lorem ipsum dolor sit amet, consectetur adipiscing sed do eiusmod
            tempor incididunt ut labore et dolore
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

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
