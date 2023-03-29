<template>
  <div
    :class="['modal', type, { 'show-close-button': showClose }]"
    @click.self="
      () => {
        if (!isPersistent) {
          close();
        }
      }
    "
  >
    <template-gallery
      v-if="type === 'template-gallery'"
      @close="close"
    ></template-gallery>

    <div v-else class="container">
      <div v-if="type === 'youtube-video'" class="content">
        <div class="aspect-ratio-box">
          <iframe
            class="aspect-ratio-box-inside"
            type="text/html"
            :src="data.url"
            frameborder="0"
            allowfullscreen
          />
        </div>
      </div>

      <div
        v-else-if="type === 'confirm'"
        :class="['content', { 'with-validation': data.validate }]"
      >
        <div class="header" v-if="showClose">
          <unnnic-icon-svg icon="close-1" size="sm" clickable @click="close" />
        </div>

        <div class="icon">
          <unnnic-icon-svg
            :icon="data.icon"
            :scheme="data.scheme"
            size="xl"
          ></unnnic-icon-svg>
        </div>

        <div class="title">{{ data.title }}</div>

        <div class="description" v-html="data.description"></div>

        <div v-if="data.validate" class="confirm-text">
          <unnnic-input
            :placeholder="data.validate.placeholder"
            v-model="confirmText"
          >
            <span slot="label" v-html="data.validate.label" />
          </unnnic-input>
        </div>

        <div class="actions">
          <unnnic-button
            type="terciary"
            @click="
              $listeners.cancel
                ? $listeners.cancel({ close: justClose })
                : close()
            "
            :disabled="loading"
          >
            {{ data.cancelText }}
          </unnnic-button>

          <unnnic-button
            :type="confirmButtonType"
            @click="
              $listeners.confirm
                ? $listeners.confirm({ close: justClose, setLoading })
                : data.onConfirm(justClose, { setLoading })
            "
            :class="
              confirmButtonType === 'primary'
                ? ['button', buttonType]
                : undefined
            "
            :disabled="disabled"
            :loading="loading"
          >
            {{ data.confirmText }}
          </unnnic-button>
        </div>
      </div>

      <template v-else-if="type === 'alert'">
        <div class="header" v-if="!isPersistent">
          <unnnic-icon-svg icon="close-1" size="sm" clickable @click="close" />
        </div>

        <div class="content">
          <div class="icon">
            <unnnic-icon-svg
              :icon="data.icon"
              :scheme="data.scheme"
              size="xl"
            ></unnnic-icon-svg>
          </div>

          <div class="title">{{ data.title }}</div>

          <div class="description">
            <dynamic :template="`<span>${data.description}</span>`"></dynamic>
          </div>
        </div>
      </template>

      <template v-else-if="type === 'info'">
        <div class="header">
          <unnnic-icon-svg
            icon="close-1"
            size="sm"
            clickable
            @click="$emit('close')"
          />
        </div>

        <div class="content">
          <slot></slot>
        </div>
      </template>

      <template v-else>
        <span></span>
      </template>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import Emoji from '../../components/Emoji.vue';
import { mapActions } from 'vuex';
import TemplateGallery from '../../views/projects/templates/gallery.vue';

const dynamic = {
  props: ['template'],
  components: {
    Emoji,
  },
  data() {
    return {
      templateRender: null,
    };
  },
  render() {
    return this.templateRender();
  },
  watch: {
    template: {
      immediate: true,
      handler() {
        const res = Vue.compile(this.template);

        this.templateRender = res.render;

        this.$options.staticRenderFns = [];

        this._staticTrees = [];

        for (let i in res.staticRenderFns) {
          this.$options.staticRenderFns.push(res.staticRenderFns[i]);
        }
      },
    },
  },
};

export default {
  components: {
    dynamic,
    TemplateGallery,
  },

  props: {
    confirmButtonType: {
      type: String,
      default: 'primary',
    },

    id: {
      type: Number,
    },

    type: {
      type: String,
    },

    data: {
      type: Object,
    },

    showClose: {
      type: Boolean,
    },

    title: {
      type: String,
      default: '',
    },

    subtitle: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      confirmText: '',
      loading: false,
    };
  },

  computed: {
    isPersistent() {
      return _.get(this.data, 'persistent');
    },

    buttonType() {
      const scheme = _.get(this.data, 'scheme');

      let type = '';

      if (scheme === 'feedback-red') {
        type = 'danger';
      } else if (scheme === 'feedback-yellow') {
        type = 'alert';
      }

      if (this.disabled) {
        return '';
      } else {
        return type;
      }
    },

    disabled() {
      return (
        _.get(this.data, 'validate.text') &&
        this.confirmText !== this.data.validate.text
      );
    },
  },

  methods: {
    ...mapActions(['closeModal']),

    close() {
      this.justClose();

      if (this.data?.onClose) {
        this.data.onClose();
      }
    },

    justClose() {
      this.closeModal(this.id);
    },

    setLoading(loading) {
      this.loading = loading;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.modal {
  z-index: 5;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, $unnnic-opacity-level-overlay);
  display: flex;
  align-items: center;
  padding: 0 12.88%;
  box-sizing: border-box;

  .container {
    flex: 1;
    max-height: 90vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-background-carpet;
    box-shadow: $unnnic-shadow-level-separated;

    .content {
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
    }
  }

  &.template-gallery {
    .container {
      max-width: 63.125rem;
      min-height: Min(90vh, 39.75rem);
      margin: 0 auto;
      padding: $unnnic-inline-md;
      display: grid;
      grid-template-columns: 13.9375rem 1fr;
      grid-template-rows: auto 1fr;
      grid-template-areas:
        'header header'
        'sidebar content';

      column-gap: $unnnic-spacing-inline-sm;
      row-gap: $unnnic-spacing-stack-md;
    }
  }

  &.youtube-video {
    .container {
      max-width: 60rem;
      margin: 0 auto;
      padding: 0 $unnnic-inline-md;
      padding-top: $unnnic-spacing-stack-giant;
      padding-bottom: $unnnic-spacing-stack-lg;
    }

    .content {
      .aspect-ratio-box {
        height: 0;
        overflow: hidden;
        padding-top: 9 / 16 * 100%;
        position: relative;
      }

      .aspect-ratio-box-inside {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }

  .icon {
    text-align: center;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  &.confirm,
  &.alert {
    .title {
      text-align: center;
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-darkest;
      font-weight: $unnnic-font-weight-black;
      font-size: $unnnic-font-size-title-sm;
      line-height: ($unnnic-font-size-title-sm + $unnnic-line-height-medium);
      padding-bottom: $unnnic-spacing-stack-md;
    }

    .description {
      text-align: center;

      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-cloudy;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: ($unnnic-font-size-body-lg + $unnnic-line-height-medium);
    }
  }

  &.confirm.show-close-button .container {
    padding-top: $unnnic-spacing-stack-sm;

    .header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: $unnnic-spacing-stack-xs;
    }
  }

  &.confirm .container {
    max-width: 31.125rem;
    margin: 0 auto;
    padding: 0 $unnnic-spacing-stack-lg;
    padding-top: $unnnic-spacing-stack-giant;
    padding-bottom: $unnnic-inline-md;

    .description {
      margin-bottom: $unnnic-spacing-stack-giant;
    }

    .content.with-validation .description {
      margin-bottom: $unnnic-spacing-stack-lg;
    }

    .confirm-text {
      margin-bottom: $unnnic-spacing-stack-lg;
    }

    .actions {
      display: grid;
      column-gap: $unnnic-inline-lg;
      grid-auto-columns: 0.5fr;
      grid-auto-flow: column;

      .button {
        &.danger:not([disabled]) {
          background-color: $unnnic-color-feedback-red;
          color: $unnnic-color-neutral-snow;
        }

        &.alert:not([disabled]) {
          background-color: $unnnic-color-feedback-yellow;
          color: $unnnic-color-neutral-snow;
        }
      }
    }
  }

  &.alert .container {
    max-width: 31.125rem;
    margin: 0 auto;
    padding: 0 $unnnic-inline-md;
    padding-top: $unnnic-spacing-stack-sm;
    padding-bottom: $unnnic-spacing-stack-giant;

    .header {
      margin-bottom: $unnnic-spacing-stack-xs;
      text-align: right;
    }
  }

  &.info .container {
    max-width: 31.125rem;
    margin: 0 auto;
    padding: 0 $unnnic-inline-md;
    padding-top: $unnnic-spacing-stack-sm;
    padding-bottom: $unnnic-spacing-stack-giant;

    .header {
      margin-bottom: $unnnic-spacing-stack-xs;
      text-align: right;
    }

    .content {
      text-align: center;

      .title {
        margin-top: $unnnic-spacing-stack-sm;
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-black;
        font-size: $unnnic-font-size-title-sm;
        line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
      }

      .description {
        margin-top: $unnnic-spacing-stack-md;
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

        a {
          color: inherit;
        }
      }
    }
  }
}
</style>
