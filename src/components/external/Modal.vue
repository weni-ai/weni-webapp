<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <UnnnicDialog
    :open="true"
    @update:open="
      () => {
        if (!isPersistent) {
          close();
        }
      }
    "
  >
    <UnnnicDialogContent
      :class="['connect-modal', type, { 'show-close-button': showClose }]"
      @click.self="
        () => {
          if (!isPersistent) {
            close();
          }
        }
      "
    >
      <UnnnicDialogHeader
        :type="dialogType"
        :closeButton="type === 'confirm' ? showClose : !isPersistent"
      >
        <UnnnicDialogTitle>{{ data.title }}</UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <div class="container">
        <div
          v-if="type === 'confirm'"
          :class="['content', { 'with-validation': data.validate }]"
        >
          <div
            class="description"
            v-html="data.description"
          ></div>

          <div
            v-if="data.validate"
            class="confirm-text"
          >
            <UnnnicInput
              v-model="confirmText"
              :placeholder="data.validate.placeholder"
            >
              <template #label>
                <span v-html="data.validate.label" />
              </template>
            </UnnnicInput>
          </div>

          <div class="actions">
            <UnnnicButton
              type="tertiary"
              :disabled="loading"
              @click="
                $attrs.cancel ? $attrs.cancel({ close: justClose }) : close()
              "
            >
              {{ data.cancelText }}
            </UnnnicButton>

            <UnnnicButton
              :type="buttonType"
              :disabled="disabled"
              :loading="loading"
              @click="
                $attrs.confirm
                  ? $attrs.confirm({ close: justClose, setLoading })
                  : data.onConfirm(justClose, { setLoading })
              "
            >
              {{ data.confirmText }}
            </UnnnicButton>
          </div>
        </div>

        <template v-else-if="type === 'alert'">
          <div class="description">
            <span v-html="data.description" />
          </div>
        </template>

        <template v-else>
          <span></span>
        </template>
      </div>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script>
import _ from 'lodash';
import { mapActions } from 'vuex';

export default {
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

      let type = this.confirmButtonType;

      if (scheme === 'feedback-red') {
        type = 'warning';
      } else if (scheme === 'feedback-yellow') {
        type = 'attention';
      }

      return type;
    },

    disabled() {
      return (
        _.get(this.data, 'validate.text') &&
        this.confirmText !== this.data.validate.text
      );
    },

    dialogType() {
      const schemeMap = {
        'feedback-red': 'warning',
        'feedback-yellow': 'warning',
        'feedback-green': 'success',
      };

      return schemeMap[this.data.scheme] || 'default';
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
.connect-modal {
  .container {
    padding: $unnnic-space-6;

    max-height: 90vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

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

  &.confirm {
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
    }
  }
}
</style>
