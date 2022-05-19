<template>
  <div class="sidebar-loading-container">
    <div class="sidebar-loading-header">
      <unnnic-skeleton-loading tag="div" width="25px" height="28px" />
      <div>
        <unnnic-skeleton-loading tag="div" height="28px" />
        <unnnic-skeleton-loading tag="div" height="28px" />
      </div>
    </div>
    <unnnic-skeleton-loading tag="div" width="39.125rem" height="28px" />
    <unnnic-skeleton-loading tag="div" width="39.125rem" height="46px" />

    <div>
      <unnnic-skeleton-loading tag="div" width="322px" />
      <unnnic-skeleton-loading tag="div" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectsLoading',
};
</script>

<style scoped lang="scss">
.sidebar-loading-container {
  width: 39.125rem;
  height: 100%;
  > div:nth-child(2) {
    margin-bottom: 6px;
  }
  > div:nth-child(3) {
    margin-bottom: 21px;
  }
  > div:nth-child(4) {
    display: flex;
    flex: 1;
    height: calc(100% - 200px);

    > div {
      width: 100%;
      height: 100%;
      &:first-child {
        margin-right: 14px;
      }
    }
  }
}
.sidebar-loading-header {
  width: 100%;
  display: flex;
  margin-bottom: 2.5rem;
  div:first-child {
    margin-right: 13px;
  }

  > div:last-child {
    width: 100%;
    > div {
      width: 100%;
    }
  }

  > div > div:first-child {
    margin-bottom: 9px;
  }
}
</style>
