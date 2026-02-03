<template>
  <UnnnicDialog
    :open="open"
    @update:open="$emit('update:open', false)"
  >
    <UnnnicDialogContent
      size="large"
      class="modal-add-content"
    >
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ $t('custom_agent.add_content.action_text') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <UnnnicTab
        class="modal-add-content__tabs"
        :activeTab="activeTab"
        :tabs="['files', 'sites', 'text']"
        @change="activeTab = $event"
      >
        <template #tab-head-files>
          {{ $t('brain.content.files.title') }}
        </template>

        <template #tab-panel-files>
          <p class="help-text">
            {{ $t('brain.content.files.help_text') }}
          </p>

          <FileImporter v-model:files="files" />
        </template>

        <template #tab-head-sites>
          {{ $t('brain.content.sites.title') }}
        </template>

        <template #tab-panel-sites>
          <p class="help-text">
            {{ $t('brain.content.sites.help_text') }}
          </p>

          <section class="sites-area">
            <UnnnicFormElement :label="$t('brain.content.sites.label')">
              <UnnnicInput
                v-for="(site, index) in sites"
                :key="index"
                v-model="site.value"
                class="form-element"
                :placeholder="$t('brain.content.sites.label')"
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

        <template #tab-head-text>
          {{ $t('brain.content.text.title') }}
        </template>

        <template #tab-panel-text>
          <p class="help-text">
            {{ $t('brain.content.text.help_text') }}
          </p>

          <UnnnicTextArea
            v-model="contentText"
            class="field-content-text"
            :placeholder="$t('brain.content.text.placeholder')"
          />
        </template>
      </UnnnicTab>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            type="tertiary"
            :text="$t('brain.content.cancel')"
          />
        </UnnnicDialogClose>

        <UnnnicButton
          type="primary"
          :text="$t('brain.content.finish')"
          @click.prevent="saveAndClose"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script>
import FileImporter from './FileImporter.vue';

export default {
  components: {
    FileImporter,
  },

  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:open'],

  data() {
    return {
      activeTab: 'files',

      files: [],
      sites: [],
      contentText: '',
    };
  },

  watch: {
    'sites.length'(length) {
      if (length === 0) {
        this.addEmptySite();
      }
    },
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

      this.$emit('update:open', false);
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-add-content {
  overflow: auto;

  &__tabs {
    margin: $unnnic-space-6;
  }

  .help-text {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;

    margin: 0;
    margin-bottom: $unnnic-space-3;
  }

  .sites-area {
    padding: $unnnic-space-4 - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-border-muted;
    border-radius: $unnnic-radius-2;

    .form-element + .form-element,
    .button-add-more {
      margin-top: $unnnic-space-2;
    }

    .button-add-more {
      width: 100%;
    }
  }

  .field-content-text :deep(textarea) {
    display: block;
    padding: $unnnic-space-4;
    min-height: 21.875 * $unnnic-font-size;
  }
}
</style>
