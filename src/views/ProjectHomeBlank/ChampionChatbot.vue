<template>
  <div
    :style="{
      width: '100%',
    }"
    class="champion-chatbot"
  >
    <div class="title">
      Sabe o que é um chatbot campeão?

      <unnnic-tool-tip
        :text="'É quando seu chatbot utiliza todos os recursos na plataforma para extrair dados assim como agilizar atendimento.'"
        enabled
        side="right"
        maxWidth="14rem"
        class="tooltip"
      >
        <unnnic-icon-svg
          icon="information-circle-4"
          size="sm"
          scheme="neutral-clean"
        />
      </unnnic-tool-tip>
    </div>

    <div class="form-control">
      <div class="icon-container color-brand-weni-soft">
        <unnnic-icon icon="check-double" size="sm" scheme="brand-weni-soft" />
      </div>

      <template v-for="i in 4">
        <unnnic-tool-tip
          :text="infosForLabel[i]"
          enabled
          side="top"
          :key="`level-${i}`"
        >
          <div
            :class="[
              'level',
              {
                'color-brand-weni-soft': i < level,
                'color-brand-weni-dark': level === i,
              },
            ]"
          ></div>
        </unnnic-tool-tip>

        <div
          v-if="level === i && level !== 4"
          class="icon-container color-brand-weni-dark"
          :key="`icon-${i}`"
        >
          <unnnic-icon icon="check-double" size="sm" scheme="brand-weni-dark" />
        </div>
      </template>

      <div class="icon-container">
        <unnnic-icon
          icon="rating-star-1-1"
          size="sm"
          scheme="feedback-yellow"
        />
      </div>
    </div>

    <div class="description">Perfil: <b>Chatbot campeão</b></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      level: 0,
    };
  },

  mounted() {
    setInterval(() => {
      this.level = (this.level + 1) % 5;
    }, 1000);
  },

  computed: {
    infosForLabel() {
      return {
        1: 'Para começar, crie um fluxo de mensagem.',
        2: 'Crie ou integre Inteligencias Artificias.',
        3: 'Adicione um canal no seu chatbot.',
        4: 'Troque mensagem com seu chatbot.',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

$colors: (
  'brand-weni-soft': $unnnic-color-brand-weni-soft,
  'brand-weni-dark': $unnnic-color-brand-weni-dark,
);

.champion-chatbot {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-stack-nano;
  padding: $unnnic-spacing-stack-xs $unnnic-spacing-inline-sm;
  background-color: $unnnic-color-background-sky;
  border-radius: $unnnic-border-radius-md;
  height: 100%;
  box-sizing: border-box;
  justify-content: center;
}

.title {
  font-family: $unnnic-font-family-primary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  color: $unnnic-color-neutral-darkest;
}

.description {
  font-family: $unnnic-font-family-primary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-title-sm;
  line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  color: $unnnic-color-neutral-darkest;

  b {
    font-weight: $unnnic-font-weight-bold;
  }
}

.form-control {
  display: flex;
  column-gap: 1px;
  width: 100%;
  align-items: center;

  .icon-container {
    width: $unnnic-icon-size-md;
    height: $unnnic-icon-size-md;
    display: flex;
    align-items: center;
    justify-content: center;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
    box-sizing: border-box;
    border-radius: 50%;
    background-color: $unnnic-color-background-snow;

    @each $name, $color in $colors {
      &.color-#{$name} {
        border-color: $color;
        background-color: rgba($color, $unnnic-opacity-level-extra-light);
      }
    }
  }

  .unnnic-tooltip {
    flex: 1;
  }

  .level {
    height: 0.5rem;
    background-color: $unnnic-color-neutral-cleanest;
    flex: 1;
    border-radius: $unnnic-border-radius-sm;

    @each $name, $color in $colors {
      &.color-#{$name} {
        background-color: $color;
      }
    }
  }
}
</style>
