<template>
  <InfiniteLoading
    :identifier="infiniteIdentifier"
    @infinite="infiniteHandler"
  >
    <template v-if="loadingIcon" #spinner>
      <Loading />
    </template>
    <template v-else-if="empty" #spinner>
      <span />
    </template>
    <template v-else #spinner>
      <p class="weni-infinite__loading">       
        {{ $t('loading') }}
      </p>
    </template>

    <template #complete>
      <span />
    </template>
    <template #no-results>
      <span />
    </template>
    <template v-show="!hideErrorSlot" #error="{ retry }">
      <div>
        <UnnnicButton
          size="small"
          type="secondary"
          @click="retry"
        >
          {{ $t('retry') }}
        </UnnnicButton>
      </div>
    </template>
    <slot
      name="loading"
      slot="spinner"
    />
  </InfiniteLoading>
</template>

<script>
import InfiniteLoading from 'v3-infinite-loading';
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
  data() {
    return {
      infiniteIdentifier: 0,
    };
  },
  methods: {
    async infiniteHandler($state) {
      this.$emit('infinite', $state);
    },
    reset() {
      this.infiniteIdentifier += 1;
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
