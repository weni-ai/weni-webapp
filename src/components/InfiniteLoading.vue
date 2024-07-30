<template>
  <InfiniteLoading
    ref="infinite"
    @infinite="infiniteHandler"
  >
    <Loading
      v-if="loadingIcon"
      slot="spinner"
    />
    <span
      v-else-if="empty"
      slot="spinner"
    />
    <span
      v-else
      class="weni-infinite__loading"
      slot="spinner"
    >
      {{ $t('loading') }}
    </span>
    <span slot="no-more" />
    <span slot="no-results" />
    <div
      v-show="!hideErrorSlot"
      slot="error"
      slot-scope="{ trigger }"
    >
      <UnnnicButton
        size="small"
        type="secondary"
        @click="trigger"
      >
        {{ $t('retry') }}
      </UnnnicButton>
    </div>
    <slot
      name="loading"
      slot="spinner"
    />
  </InfiniteLoading>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import Loading from './Loading.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Orgs',
  components: {
    InfiniteLoading,
    Loading,
  },
  props: {
    loadingIcon: {
      type: Boolean,
      default: false,
    },

    empty: {
      type: Boolean,
      default: false,
    },

    hideErrorSlot: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    async infiniteHandler($state) {
      this.$emit('infinite', $state);
    },
    reset() {
      this.$refs.infinite.stateChanger.reset();
    },
  },
};
</script>

<style lang="scss" scoped>

.weni-infinite {
  &__loading {
    width: 100%;
    text-align: center;
    color: $unnnic-color-neutral-cleanest;
    font-family: $unnnic-font-family-secondary;
  }
}
</style>
