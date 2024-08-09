<template>
  <UnnnicModal
    class="modal-add-content"
    :text="$t('custom_agent.add_content.action_text')"
    scheme="aux-green-500"
    :closeIcon="false"
  >
    <UnnnicTab
      v-model="activeTab"
      :tabs="['files', 'sites', 'text']"
    >
      <template slot="tab-head-files">
        {{ $t('brain.content.files.title') }}
      </template>

      <template slot="tab-panel-files">
        <p class="help-text">
          {{ $t('brain.content.files.help_text') }}
        </p>

        <FileImporter :files.sync="files" />
      </template>

      <template slot="tab-head-sites">
        {{ $t('brain.content.sites.title') }}
      </template>

      <template slot="tab-panel-sites">
        <p class="help-text">
          {{ $t('brain.content.sites.help_text') }}
        </p>

        <section class="sites-area">
          <UnnnicFormElement :label="$t('brain.content.sites.label')">
            <UnnnicInput
              class="form-element"
              v-for="(site, index) in sites"
              :key="index"
              :placeholder="$t('brain.content.sites.label')"
              v-model="site.value"
              :iconRight="site.value ? 'delete' : undefined"
              iconRightClickable
              @icon-right-click="deleteSite(site)"
            />
          </UnnnicFormElement>

          <UnnnicButton
            class="button-add-more"
            type="tertiary"
            size="small"
            iconLeft="add-1"
            @click.prevent="addEmptySite"
          >
            {{ $t('brain.content.sites.add_another_site') }}
          </UnnnicButton>
        </section>
      </template>

      <template slot="tab-head-text">
        {{ $t('brain.content.text.title') }}
      </template>

      <template slot="tab-panel-text">
        <p class="help-text">
          {{ $t('brain.content.text.help_text') }}
        </p>

        <UnnnicTextArea
          class="field-content-text"
          :placeholder="$t('brain.content.text.placeholder')"
          v-model="contentText"
        />
      </template>
    </UnnnicTab>

    <footer class="modal-add-content__footer">
      <UnnnicButton
        type="tertiary"
        @click.prevent="$emit('close')"
      >
        {{ $t('brain.content.cancel') }}
      </UnnnicButton>

      <UnnnicButton @click.prevent="saveAndClose">
        {{ $t('brain.content.finish') }}
      </UnnnicButton>
    </footer>
  </UnnnicModal>
</template>

<script>
import FileImporter from './FileImporter.vue';

export default {
  components: {
    FileImporter,
  },

  data() {
    return {
      activeTab: 'files',

      files: [],
      sites: [],
      contentText: '',
    };
  },

  created() {
    this.contentText = this.$store.state.Brain.content.text;

    this.$store.state.Brain.content.files.forEach((file) => {
      this.files.push(file);
    });

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

      this.$store.state.Brain.content.files = this.files;

      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.modal-add-content {
  overflow: auto;

  ::v-deep .unnnic-modal-container {
    height: auto;
    min-height: 100vh;
  }

  ::v-deep .unnnic-modal-container-background {
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
