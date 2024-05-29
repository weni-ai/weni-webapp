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

      <template slot="tab-panel-sites">
        <p class="help-text">
          {{ 'Adicionar conteúdo de sites.' }}
        </p>

        <section class="sites-area">
          <unnnic-form-element :label="'Link do site'">
            <unnnic-input
              class="form-element"
              v-for="(site, index) in sites"
              :key="index"
              :placeholder="'Link do site'"
              v-model="site.value"
              :iconRight="site.value ? 'bin-1-1' : undefined"
              iconRightClickable
              @icon-right-click="deleteSite(site)"
            />
          </unnnic-form-element>

          <unnnic-button
            class="button-add-more"
            type="tertiary"
            size="small"
            iconLeft="add-1"
            @click.prevent="addEmptySite"
          >
            {{ 'Adicionar mais um site' }}
          </unnnic-button>
        </section>
      </template>

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

      sites: [],
    };
  },

  created() {
    this.contentText = this.$store.state.Brain.content.text;

    this.$store.state.Brain.content.sites.forEach((site) => {
      this.sites.push({ value: site });
    });

    if (this.sites.length === 0) {
      this.addEmptySite();
    }
  },

  watch: {
    'sites.length'(length) {
      if (length === 0) {
        this.addEmptySite();
      }
    },
  },

  methods: {
    addEmptySite() {
      this.sites.push({ value: '' });
    },

    deleteSite(site) {
      this.sites.splice(this.sites.indexOf(site), 1);
    },

    saveAndClose() {
      this.$store.state.Brain.content.text = this.contentText;

      this.$store.state.Brain.content.sites = this.sites
        .map(({ value }) => value)
        .filter((site) => site);

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

  .sites-area {
    padding: $unnnic-spacing-sm - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;

    .form-element + .form-element,
    .button-add-more {
      margin-top: $unnnic-spacing-xs;
    }

    .button-add-more {
      width: 100%;
    }
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
