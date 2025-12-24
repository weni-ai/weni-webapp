<template>
  <div
    :class="expand ? 'expand-multiselect' : 'normal-multiselect'"
    tabindex="-1"
  >
    <span
      v-if="label"
      class="select-permission-label"
    >
      {{ label }}
    </span>
    <div
      class="select-permission"
      tabindex="0"
      @keypress="handleIsOpenKeyboard"
      @click="active = !active"
    >
      <h6 class="title noselect">{{ inputTitle }}</h6>
      <UnnnicIcon
        :icon="active ? 'arrow-button-up-1' : 'arrow-button-down-1'"
        size="sm"
        scheme="neutral-dark"
      />
    </div>
    <div
      v-if="active"
      v-on-click-outside="onClickOutside"
      class="select-content"
      tabindex="0"
    >
      <div>
        <template
          v-for="(group, indexGroup) in modelValue"
          :key="`group-${indexGroup}`"
        >
          <h6
            v-if="!hideGroupTitle"
            :key="`title-${indexGroup}`"
            class="title"
          >
            {{ group.title }}
          </h6>
          <section>
            <template
              v-for="(item, indexItem) in group.items"
              :key="`item-${indexItem}`"
            >
              <div
                v-if="hideRadio"
                :key="indexItem + 'input'"
                class="unnnic-radio-container unnnic-radio-container--sm"
                style="cursor: pointer"
                @click="change(indexGroup, indexItem)"
              >
                <strong>{{ item.title }}</strong>
                <span>{{ item.description }}</span>
              </div>
              <UnnnicRadio
                v-else
                id=""
                :key="'else' + indexItem + 'input'"
                name=""
                :modelValue="group.selected"
                :value="indexItem"
                size="sm"
                class=""
                @update:model-value="change(indexGroup, $event)"
              >
                <strong>{{ item.title }}</strong>
                <span>{{ item.description }}</span>
              </UnnnicRadio>
            </template>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { vOnClickOutside } from '@vueuse/components';

export default {
  name: 'MultiSelectRadios',

  directives: {
    onClickOutside: vOnClickOutside,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    expand: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    inputTitle: {
      type: String,
      default: 'Teste',
    },
    hideRadio: {
      type: Boolean,
      default: false,
    },
    hideGroupTitle: {
      type: Boolean,
      default: false,
    },
    unselectable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:model-value'],

  data() {
    return {
      active: false,
    };
  },

  watch: {
    isOpen() {
      this.active = this.open;
    },
  },
  methods: {
    handleIsOpenKeyboard(event) {
      if (
        document.querySelector('.select-permission:focus-visible') &&
        event.keyCode === 32
      ) {
        this.active = !this.active;
      }
    },

    onClickOutside() {
      if (!this.active) return;
      this.active = false;
    },

    change(indexGroup, indexSelected) {
      this.$emit(
        'update:model-value',
        this.modelValue.map((item, index) => {
          if (index === indexGroup) {
            let selected = indexSelected;
            if (this.unselectable && item.selected === indexSelected) {
              selected = -1;
            }
            return { ...item, selected };
          }

          return item;
        }),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.normal-multiselect,
.expand-multiselect {
  user-select: none;
}

.normal-multiselect {
  position: relative;
  max-width: 319px;

  .select-content {
    max-width: 319px;
  }
}

.expand-multiselect {
  position: relative;
  width: 100%;

  .select-content {
    width: 100%;
  }
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome, Edge, Opera and Firefox */
}

.select-permission,
.select-content > div {
  padding: $unnnic-squish-xs;
  background-color: $unnnic-color-neutral-snow;

  border-radius: $unnnic-border-radius-sm;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
}
.select-permission {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;

  cursor: pointer;
  .icon {
    margin-left: $unnnic-spacing-inline-xs;
  }
}
.select-permission-label {
  display: block;

  color: $unnnic-color-neutral-cloudy;
  margin-bottom: $unnnic-spacing-stack-xs;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
}

.title {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  margin: 0;
  font-weight: $unnnic-font-weight-regular;
  color: $unnnic-color-neutral-dark;
}

.select-content {
  position: absolute;
  margin-top: $unnnic-spacing-stack-xs;

  > div {
    box-shadow: $unnnic-shadow-level-near;
    .title {
      margin-bottom: $unnnic-spacing-stack-sm;
    }

    & section {
      display: flex;
      flex-direction: column;

      & + h6 {
        margin-top: $unnnic-spacing-stack-sm;
        padding-top: $unnnic-spacing-stack-sm;
        border-top: $unnnic-border-width-thinner solid
          $unnnic-color-neutral-darkest;
      }

      strong,
      span {
        display: block;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
      }

      strong {
        font-weight: $unnnic-font-weight-regular;
      }
      span {
        font-weight: $unnnic-font-weight-light;
      }

      .unnnic-radio-container {
        & + .unnnic-radio-container {
          margin-top: $unnnic-spacing-stack-sm;
          padding-top: $unnnic-spacing-stack-sm;
          border-top: $unnnic-border-width-thinner solid
            $unnnic-color-neutral-lightest;
        }

        :deep(.unnnic-icon) {
          margin-right: $unnnic-inline-xs;
        }
      }
    }
  }
}
</style>
