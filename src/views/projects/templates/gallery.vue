<template>
  <div class="container">
    <div class="header">
      <div class="title">
        <span class="u font secondary title-sm bold color-neutral-darkest">
          Galeria de templates
        </span>

        <unnnic-icon
          icon="close-1"
          size="sm"
          clickable
          @click="$emit('close')"
        />
      </div>

      <unnnic-input-next
        size="sm"
        icon-left="search-1"
        placeholder="Busque por templates..."
      />
    </div>

    <div class="sidebar">
      <p>Categorias</p>
      <p>Vendas</p>
      <p>Suporte</p>
      <p>Integrações</p>
    </div>

    <div class="content">
      <div class="template">
        <div class="template__title">
          <p>Suporte</p>
          <div class="template__title__button">
            <unnnic-button-icon
              type="secondary"
              icon="check-circle-1-1"
              size="small"
            >
            </unnnic-button-icon>
          </div>
        </div>
        <div class="template__description">
          <p>
            Este fluxo agiliza o atendimento de suporte da sua empresa
            utilizando integração com Whatsapp demo e inteligência artificial.
          </p>
        </div>
        <div class="template__indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            text="Suporte"
            type="default"
          ></unnnic-tag>
        </div>
      </div>

      <div class="template">
        <div class="template__title">
          <p>Suporte</p>
          <div class="template__title__button">
            <unnnic-button-icon
              type="secondary"
              icon="check-circle-1-1"
              size="small"
            >
            </unnnic-button-icon>
          </div>
        </div>
        <div class="template__description">
          <p>
            Este fluxo agiliza o atendimento de suporte da sua empresa
            utilizando integração com Whatsapp demo e inteligência artificial.
          </p>
        </div>
        <div class="template__indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            text="Suporte"
            type="default"
          ></unnnic-tag>
        </div>
      </div>

      <div class="template">
        <div class="template__title">
          <p>Suporte</p>
          <div class="template__title__button">
            <unnnic-button-icon
              type="secondary"
              icon="check-circle-1-1"
              size="small"
            >
            </unnnic-button-icon>
          </div>
        </div>
        <div class="template__description">
          <p>
            Este fluxo agiliza o atendimento de suporte da sua empresa
            utilizando integração com Whatsapp demo e inteligência artificial.
          </p>
        </div>
        <div class="template__indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            text="Suporte"
            type="default"
          ></unnnic-tag>
        </div>
      </div>

      <div class="template">
        <div class="template__title">
          <p>Suporte</p>
          <div class="template__title__button">
            <unnnic-button-icon
              type="secondary"
              icon="check-circle-1-1"
              size="small"
            >
            </unnnic-button-icon>
          </div>
        </div>
        <div class="template__description">
          <p>
            Este fluxo agiliza o atendimento de suporte da sua empresa
            utilizando integração com Whatsapp demo e inteligência artificial.
          </p>
        </div>
        <div class="template__indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            text="Suporte"
            type="default"
          ></unnnic-tag>
        </div>
      </div>

      <div class="template">
        <div class="template__title">
          <p>Suporte</p>
          <div class="template__title__button">
            <unnnic-button-icon
              type="secondary"
              icon="check-circle-1-1"
              size="small"
            >
            </unnnic-button-icon>
          </div>
        </div>
        <div class="template__description">
          <p>
            Este fluxo agiliza o atendimento de suporte da sua empresa
            utilizando integração com Whatsapp demo e inteligência artificial.
          </p>
        </div>
        <div class="template__indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            text="Suporte"
            type="default"
          ></unnnic-tag>
        </div>
      </div>

      <div v-show="false" class="template">
        <div class="template__title">
          <p>Suporte</p>
          <div class="template__title__button">
            <unnnic-button-icon
              type="secondary"
              icon="check-circle-1-1"
              size="small"
            >
            </unnnic-button-icon>
          </div>
        </div>
        <div class="template__description">
          <p>
            Este fluxo agiliza o atendimento de suporte da sua empresa
            utilizando integração com Whatsapp demo e inteligência artificial.
          </p>
        </div>
        <div class="template__indicators">
          <unnnic-tag
            class="category"
            scheme="aux-baby-blue"
            text="Suporte"
            type="default"
          ></unnnic-tag>
        </div>
      </div>

      <div class="blank">
        <unnnic-icon scheme="neutral-clean" icon="add-1" size="xl" />

        <div class="u font secondary body-md color-neutral-cloudy">
          {{ $t('projects.create.format.blank.title') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
  font-size: $unnnic-font-size-body-md;
  color: $unnnic-color-neutral-cloudy;
  height: fit-content;

  p:first-child {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    margin-top: unset;
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

  gap: $unnnic-spacing-stack-sm $unnnic-spacing-inline-sm;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));

  .template {
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: 8px;
    padding: $unnnic-spacing-inset-sm;
    background-color: $unnnic-color-background-snow;

    &__title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: $unnnic-font-weight-bold;

      &__button {
        display: flex;
        align-items: center;
      }
    }

    &__description {
      font-size: $unnnic-font-size-body-md;
      color: $unnnic-color-neutral-cloudy;
      line-height: 20px;
      height: 110px;
    }

    &__indicators {
      width: fit-content;
      margin-top: $unnnic-spacing-inset-sm;
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
</style>
