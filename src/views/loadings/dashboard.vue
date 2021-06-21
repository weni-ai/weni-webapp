<template>
  <div class="weni-home__content unnnic-grid-giant">
    <div class="unnnic-grid-span-8">
      <unnnic-skeleton-loading tag="div" height="104px" />
    </div>
    <div class="unnnic-grid-span-4">
      <unnnic-skeleton-loading tag="div" height="104px" />
    </div>

    <div v-for="n in 3" :key="n" class="unnnic-grid-span-4">
      <div class="dash-loading-card">
        <unnnic-skeleton-loading tag="div" width="40px" height="40px" />
        <unnnic-skeleton-loading tag="div" height="40px" />
      </div>
    </div>

    <div class="unnnic-grid-span-4">
      <unnnic-skeleton-loading
        v-for="n in 3"
        tag="div"
        height="107px"
        :key="n"
        style="margin-bottom: 1rem"
      />
    </div>
    <div class="unnnic-grid-span-4">
      <unnnic-skeleton-loading
        v-for="n in 4"
        tag="div"
        height="93px"
        :key="n"
        style="margin-bottom: 1rem"
      />
    </div>
    <div class="unnnic-grid-span-4 dash-loading-news">
      <unnnic-skeleton-loading tag="div" />
    </div>
  </div>
</template>

<script>
import { unnnicSkeletonLoading } from '@weni/unnnic-system';

export default {
  name: 'ProjectsLoading',
  components: {
    unnnicSkeletonLoading,
  },
};
</script>

<style scoped lang="scss">
.dash-loading-card {
  display: flex;
  > div:first-child {
    margin-right: 1rem;
  }
  div:last-child {
    width: 100%;
  }
}

.dash-loading-news {
  height: calc(100% - 1rem);
  > div {
    height: 100%;
  }
}
</style>
