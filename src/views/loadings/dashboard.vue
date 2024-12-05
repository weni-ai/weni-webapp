<template>
  <div class="weni-home__content unnnic-grid-giant">
    <div class="unnnic-grid-span-8">
      <UnnnicSkeletonLoading
        tag="div"
        height="104px"
      />
    </div>
    <div class="unnnic-grid-span-4">
      <UnnnicSkeletonLoading
        tag="div"
        height="104px"
      />
    </div>

    <div
      v-for="n in 3"
      :key="n"
      class="unnnic-grid-span-4"
    >
      <div class="dash-loading-card">
        <UnnnicSkeletonLoading
          tag="div"
          width="40px"
          height="40px"
        />
        <UnnnicSkeletonLoading
          tag="div"
          height="40px"
        />
      </div>
    </div>

    <div class="unnnic-grid-span-4">
      <UnnnicSkeletonLoading
        v-for="n in 3"
        :key="n"
        tag="div"
        height="107px"
        style="margin-bottom: 1rem"
      />
    </div>
    <div class="unnnic-grid-span-4">
      <UnnnicSkeletonLoading
        v-for="n in 4"
        :key="n"
        tag="div"
        height="93px"
        style="margin-bottom: 1rem"
      />
    </div>
    <div class="unnnic-grid-span-4 dash-loading-news">
      <UnnnicSkeletonLoading tag="div" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectsLoading',
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
