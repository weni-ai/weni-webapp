<template>
  <unnnic-modal
    class="modal-add-content"
    :text="'Adicionar conteúdo'"
    scheme="aux-green-500"
    :closeIcon="false"
  >
    <unnnic-tab
      v-model="activeTab"
      :tabs="['files', 'sites', 'text']"
    >
      <template slot="tab-head-files">
        {{ 'Arquivo' }}
      </template>

      <template slot="tab-panel-files"></template>

      <template slot="tab-head-sites">
        {{ 'Site' }}
      </template>

      <template slot="tab-panel-sites"></template>

      <template slot="tab-head-text">
        {{ 'Texto' }}
      </template>

      <template slot="tab-panel-text">
        <p class="help-text">
          {{ 'Adicionar conteúdo escrito manualmente.' }}
        </p>

        <unnnic-text-area
          class="field-content-text"
          :placeholder="'Escreva aqui o conteúdo'"
          v-model="contentText"
        />
      </template>
    </unnnic-tab>

    <footer class="modal-add-content__footer">
      <unnnic-button
        type="tertiary"
        @click.prevent="$emit('close')"
      >
        Cancelar
      </unnnic-button>

      <unnnic-button @click.prevent="saveAndClose">Concluir</unnnic-button>
    </footer>
  </unnnic-modal>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'files',

      contentText: '',
    };
  },

  created() {
    this.contentText = this.$store.state.Brain.content.text;
  },

  methods: {
    saveAndClose() {
      this.$store.state.Brain.content.text = this.contentText;

      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.modal-add-content {
  :deep(.unnnic-modal-container-background) {
    width: 100%;
    max-width: 43.75 * $unnnic-font-size;

    &-body {
      padding-top: $unnnic-spacing-xl;

      &-description {
        text-align: initial;

        &-container {
          padding-bottom: $unnnic-spacing-md;
        }
      }
    }
  }

  .help-text {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;

    margin: 0;
    margin-bottom: $unnnic-spacing-ant;
  }

  .field-content-text :deep(textarea) {
    display: block;
    padding: $unnnic-spacing-sm;
    min-height: 21.875 * $unnnic-font-size;
  }

  &__footer {
    display: flex;
    column-gap: $unnnic-spacing-sm;
    margin-top: $unnnic-spacing-md;

    > * {
      flex: 1;
    }
  }
}
</style>
