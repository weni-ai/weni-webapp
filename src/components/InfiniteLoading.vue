<template>
    <infinite-loading @infinite="infiniteHandler">
      <loading slot="spinner" />
      <span slot="no-more"/>
      <span slot="no-results" />
      <div slot="error" slot-scope="{ trigger }">
        <unnnic-button
          size="small"
          type="secondary"
          @click="trigger">
          {{ $t('retry') }}
        </unnnic-button>
      </div>
    </infinite-loading>
</template>

<script>
import { unnnicButton } from 'unnic-system-beta';
import InfiniteLoading from 'vue-infinite-loading';
import Loading from './Loading';

export default {
  name: 'Orgs',
  components: {
    unnnicButton,
    InfiniteLoading,
    Loading,
  },
  methods: {
    async infiniteHandler($state) {
      this.$emit('infinite', $state);
    },
  },
};
</script>