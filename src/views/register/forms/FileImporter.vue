<template>
  <section>
    <input
      v-show="false"
      ref="browser-file-input"
      type="file"
      multiple
      @click.stop
      @change="drop"
    />

    <section
      :class="['drag-area', { 'drag-area--is-dragging': isDragging }]"
      @click.prevent="browserFiles"
      @dragover.prevent
      @drop.prevent="drop"
    >
      <UnnnicIcon
        icon="download"
        scheme="weni-500"
        size="lg"
      />

      <header>
        <h3>
          {{ $t('brain.file_importer.drag_or_click_to_search') }}
        </h3>

        <p v-html="$t('brain.file_importer.supported_formats')" />
      </header>
    </section>

    <section class="files">
      <section
        class="files__file"
        v-for="(file, index) in files"
        :key="index"
      >
        <UnnnicIcon
          class="files__file__icon"
          icon="picture_as_pdf"
          scheme="weni-600"
          size="md"
        />

        <h3
          class="files__file__title"
          :title="file.name"
        >
          {{ treatName(file.name) }}
        </h3>

        <UnnnicIcon
          class="files__file__button-delete"
          icon="delete"
          scheme="neutral-cloudy"
          size="sm"
          @click.native="deleteFile(file)"
        />
      </section>
    </section>
  </section>
</template>

<script>
import { get } from 'lodash';

export default {
  props: {
    files: [],
  },

  data() {
    return {
      isDragging: false,
      leave: null,

      events: {
        dragover: (event) => {
          event.preventDefault();

          clearTimeout(this.leave);

          this.isDragging = true;
        },

        dragleave: () => {
          clearTimeout(this.leave);

          this.leave = setTimeout(() => {
            this.isDragging = false;
          }, 100);
        },

        drop: () => {
          this.isDragging = false;
        },
      },
    };
  },

  mounted() {
    Object.keys(this.events).forEach((eventName) => {
      window.addEventListener(eventName, this.events[eventName]);
    });
  },

  beforeDestroy() {
    Object.keys(this.events).forEach((eventName) => {
      window.removeEventListener(eventName, this.events[eventName]);
    });
  },

  methods: {
    browserFiles() {
      this.$refs['browser-file-input'].click();
    },

    drop(event) {
      const files =
        get(event, 'dataTransfer.files') || get(event, 'srcElement.files');

      if (!get(files, 'length', 0)) {
        return;
      }

      this.$emit('update:files', this.files.concat(Object.values(files)));
    },

    deleteFile(file) {
      this.$emit(
        'update:files',
        this.files.filter((item) => item !== file),
      );
    },

    treatName(name) {
      const maxLength = 74;
      const concatenator = '...';

      if (name.length > maxLength) {
        return (
          name.slice(0, Math.ceil((maxLength - concatenator.length) / 2)) +
          concatenator +
          name.slice(-Math.floor((maxLength - concatenator.length) / 2))
        );
      } else {
        return name;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.drag-area {
  user-select: none;
  cursor: pointer;
  padding: $unnnic-spacing-lg - $unnnic-border-width-thinner;
  border: $unnnic-border-width-thinner dashed $unnnic-color-neutral-clean;
  border-radius: $unnnic-border-radius-md;

  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: $unnnic-spacing-xs;

  &--is-dragging {
    background-color: $unnnic-color-weni-50;
    border-color: $unnnic-color-weni-500;
  }

  header {
    h3,
    p {
      margin: 0;
    }

    h3 {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    p {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }
  }
}

.files {
  margin-top: $unnnic-spacing-ant;

  &__file {
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-xs;
    padding: $unnnic-spacing-xs - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    background-color: $unnnic-color-neutral-white;
    border-radius: $unnnic-border-radius-sm;

    &__icon,
    &__button-delete {
      user-select: none;
      padding: $unnnic-spacing-xs;
    }

    &__title {
      margin: 0;
      flex: 1;

      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    &__button-delete {
      cursor: pointer;
    }

    & + & {
      margin-top: $unnnic-spacing-nano;
    }
  }
}
</style>
