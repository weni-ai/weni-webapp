<template>
  <div class="gallery">
    <div class="title">
      Galeria de templates
    </div>

    <div class="search">
      <unnnic-autocomplete
        placeholder="Busque por templates"
        size="sm"
        icon-left="search-1"
      />
    </div>

    <div class="templates-container">
      <div class="filters">
        <p>Categorias</p>
        <p>Vendas</p>
        <p>Suporte</p>
        <p>Integrações</p>
      </div>
  
      <div class="templates">
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
              Este fluxo agiliza o atendimento de suporte da sua empresa utilizando integração com Whatsapp demo e inteligência artificial.
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
              Este fluxo agiliza o atendimento de suporte da sua empresa utilizando integração com Whatsapp demo e inteligência artificial.
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
              Este fluxo agiliza o atendimento de suporte da sua empresa utilizando integração com Whatsapp demo e inteligência artificial.
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
              Este fluxo agiliza o atendimento de suporte da sua empresa utilizando integração com Whatsapp demo e inteligência artificial.
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
              Este fluxo agiliza o atendimento de suporte da sua empresa utilizando integração com Whatsapp demo e inteligência artificial.
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
              Este fluxo agiliza o atendimento de suporte da sua empresa utilizando integração com Whatsapp demo e inteligência artificial.
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
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.gallery {
  padding: $unnnic-spacing-stack-md;
  background: #F9F9F9;
  .title {
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-title-sm;
    color: $unnnic-color-neutral-darkest;
    display: flex;
    justify-content: center;
  }

  .search {
    margin-top: $unnnic-spacing-stack-md;
  }

  .templates-container {
    margin-top: $unnnic-spacing-stack-md;
    display: flex;
    gap: $unnnic-spacing-stack-md;
    height: 100%;

    .filters {
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      border-radius: 8px;
      padding: $unnnic-spacing-inset-sm;
      min-width: 223px;
      height: 148px;
      background-color: $unnnic-color-background-snow;
      font-size: $unnnic-font-size-body-md;
      color: $unnnic-color-neutral-cloudy;

      p:first-child {
        color: $unnnic-color-neutral-darkest;
        font-size: $unnnic-font-size-body-gt;
        font-weight: $unnnic-font-weight-bold;
        margin-top: unset;
      }
    }

    .templates {
      display: flex;
      width: 100%;
      flex-wrap: wrap;
      gap: $unnnic-spacing-stack-md;
      .template {
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
        border-radius: 8px;
        padding: $unnnic-spacing-inset-sm;
        width: 207px;
        height: 214px;
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
    }
  }
}
</style>