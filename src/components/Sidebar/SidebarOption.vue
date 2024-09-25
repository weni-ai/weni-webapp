<template>
  <section class="disabled-modal__container">
    <SidebarOptionInside
      v-bind="commomProps"
      v-if="isStaticOption"
      tag="section"
      @click="toggleShowChildren"
      :selected="isActiveInChildren && !showChildren"
      :iconRightRotate180deg="showChildren"
    />

    <UnnnicDropdown
      v-else-if="isDropdownOption"
      position="bottom-right"
      class="dropdown"
      :open="showChildren"
    >
      <template #trigger>
        <SidebarOptionInside
          v-bind="commomProps"
          tag="section"
          :selected="isActiveInChildren || (useDropdown && showChildren)"
          :iconRight="iconRight"
        />
      </template>

      <section class="dropdown__content">
        <section class="dropdown__content__title">
          {{ tooltipText || option.label }}
        </section>

        <section class="children">
          <slot name="dropdown-content">
            <SidebarOption
              v-for="(option, index) in option.children"
              :key="index"
              :option="option"
              isExpanded
              isInDropdown
            />
          </slot>
        </section>
      </section>
    </UnnnicDropdown>

    <RouterLink
      v-else-if="isLinkOption"
      :to="option.viewUrl"
      custom
      v-slot="slot"
    >
      <SidebarOptionInside
        v-bind="commomProps"
        tag="a"
        :href="slot.href"
        :selected="slot[option.type]"
        @click="slot.navigate"
      />
    </RouterLink>

    <Transition name="expand">
      <section
        v-show="isAccordionOpen"
        class="children children--expanded-container"
        data-test="accordion-content"
      >
        <SidebarOption
          v-for="(option, index) in option.children"
          :key="index"
          :option="option"
          isExpanded
        />
      </section>
    </Transition>

    <SidebarModal
      class="disabled-modal"
      v-if="option.disabled && option.disabledModal"
      :title="option.disabledModal.title"
      :description="option.disabledModal.description"
      :image="option.disabledModal.image"
    />
  </section>
</template>

<script>
export default {
  name: 'SidebarOption',
};
</script>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SidebarOptionInside from './SidebarOptionInside.vue';
import SidebarModal from './SidebarModal.vue';


const router = useRouter();
const route = useRoute();

const props = defineProps({
  option: Object,
  isExpanded: Boolean,
  isInDropdown: Boolean,
  useDropdown: Boolean,
  useEllipsis: Boolean,
  iconRight: String,
  tooltipText: String,
  variant: String,
  iconRotate180deg: Boolean,

  align: {
    type: String,
    default: 'left',
  },
});

const showChildren = ref(false);

const childHeight = 38;
const childSpacingNano = 4;

const childrenHeight = ref(
  `${
    (props.option?.children?.length || 0) * (childHeight + childSpacingNano)
  }px`,
);

const isAccordionOpen = computed(() => {
  if (props.option.disabled || props.useDropdown) {
    return false;
  }

  return props.isExpanded && showChildren.value;
});

const isActiveInChildren = computed(() => {
  return (props.option.children || [])
    .filter(({ viewUrl }) => viewUrl)
    .map(({ viewUrl }) => viewUrl)
    .some(isActive);
});

function isActive(url) {
  return router
    .resolve(url)
    .matched.some(({ name }) => name === route.name);
}

const isStaticOption = computed(() => {
  const isExpandable =
    !props.useDropdown && props.isExpanded && props.option.children;

  return props.option.disabled || isExpandable || props.variant === 'static';
});

const isDropdownOption = computed(() => {
  return props.useDropdown || props.option.children;
});

const isLinkOption = computed(() => {
  return props.option.viewUrl;
});

function toggleShowChildren() {
  if (props.option.children) {
    showChildren.value = !showChildren.value;
  }
}

watch(
  () => props.isExpanded,
  () => {
    if (props.isExpanded && isActiveInChildren.value) {
      showChildren.value = true;
    } else {
      showChildren.value = false;
    }
  },
  { immediate: true },
);

const commomProps = computed(() => {
  const getVariant = () => {
    if (props.variant) {
      return props.variant;
    }

    if (props.isInDropdown) {
      return 'dropdown-content';
    }

    if (props.useDropdown) {
      return 'outline';
    }

    return 'normal';
  };

  return {
    icon: props.option.icon,
    iconRotate180deg: props.iconRotate180deg,
    title: props.option.label,
    label: props.option.tag,
    align: props.align,
    useEllipsis: props.useEllipsis,
    disabled: props.option.disabled,
    expanded: props.isExpanded,
    hasNotification: props.option.hasNotification,
    isAccordion: !!props.option.children,
    enableTooltip: !props.isExpanded,
    tooltipText: props.tooltipText,
    variant: getVariant(),
  };
});
</script>

<style lang="scss" scoped>
.expand-enter-active,
.expand-leave-active {
  transition: height 100ms;
  height: v-bind(childrenHeight);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
}

.children {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-nano;

  &--expanded-container {
    $spacing-left: 1.25 * $unnnic-font-size;

    margin-left: $spacing-left - $unnnic-border-width-thinner;

    padding-top: $unnnic-spacing-nano;
    padding-left: $unnnic-spacing-ant;
    border-left: $unnnic-border-width-thinner solid
      $unnnic-color-neutral-darkest;

    box-sizing: border-box;
  }
}

.dropdown {
  :deep(.unnnic-dropdown__trigger) {
    display: block;
  }

  :deep(.unnnic-dropdown__content) {
    margin-top: $unnnic-spacing-nano;
    left: 0;

    padding: $unnnic-spacing-xs;
    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-neutral-darkest;
    box-shadow: $unnnic-shadow-level-near;
    width: 14.875 * $unnnic-font-size;
    box-sizing: border-box;
  }

  &__content {
    &__title {
      user-select: none;

      color: $unnnic-color-neutral-clean;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

      margin-bottom: $unnnic-spacing-xs;
    }
  }
}

.disabled-modal {
  position: absolute;
  top: -$unnnic-spacing-sm;
  left: 100%;
  z-index: 1;
  width: 16.875 * $unnnic-font-size;
  box-sizing: border-box;

  &__container {
    position: relative;

    > .disabled-modal {
      display: none;
    }

    &:hover > .disabled-modal {
      display: block;
    }
  }
}
</style>
