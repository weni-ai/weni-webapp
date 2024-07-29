<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="header">
      <UnnnicSkeletonLoading
        class="title"
        tag="div"
        height="59px"
      />

      <div class="tabs">
        <UnnnicSkeletonLoading
          v-for="i in 3"
          :key="i"
          tag="div"
          width="127px"
          height="24px"
        />
      </div>
    </div>

    <div class="content">
      <div
        v-for="i in 3"
        :key="i"
        class="item"
      >
        <UnnnicSkeletonLoading
          tag="div"
          height="123px"
        />
      </div>
    </div>

    <div class="list">
      <div
        v-for="i in 4"
        :key="i"
      >
        <UnnnicSkeletonLoading
          tag="div"
          height="55px"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.header {
  .title {
    margin-bottom: 9px;
  }

  .tabs {
    padding-bottom: 1rem;
    border-bottom: 1px solid $unnnic-color-neutral-soft;
    display: flex;
    column-gap: 1rem;
  }
}

.content {
  padding: $unnnic-spacing-stack-md 0;
  display: flex;
  column-gap: 1rem;

  .item {
    flex: 1;
  }
}

.list {
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
}
</style>
