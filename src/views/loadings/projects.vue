<template>
  <div>
    <div class="project-loading-header">
      <div class="project-loading-header__left">
        <UnnnicSkeletonLoading tag="div" />
        <UnnnicSkeletonLoading tag="div" />
      </div>
      <div class="project-loading-header__right">
        <UnnnicSkeletonLoading tag="div" />
      </div>
    </div>

    <div class="project-loading-options">
      <UnnnicSkeletonLoading
        tag="div"
        width="95px"
        height="32px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        circle
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="91px"
        height="32px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        circle
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="110px"
        height="32px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        circle
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="90px"
        height="32px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        circle
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="82px"
        height="32px"
      />
    </div>

    <div class="project-loading-grid">
      <UnnnicSkeletonLoading
        tag="div"
        height="142px"
      />
      <div
        v-for="n in 11"
        class="project-loading-grid__item"
        :key="n"
      >
        <div>
          <UnnnicSkeletonLoading
            tag="div"
            width="216px"
            height="49px"
          />
          <UnnnicSkeletonLoading
            class="project-loading-grid__item__small"
            tag="div"
            width="12px"
            height="12px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="51px"
            height="25px"
          />
        </div>
        <UnnnicSkeletonLoading
          tag="div"
          width="100%"
          height="50px"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectsLoading',
};
</script>

<style scoped lang="scss">
.project-loading-header {
  div {
    width: 100%;
    box-sizing: border-box;
  }
  display: flex;
  justify-content: space-between;

  &__left {
    div:first-child {
      height: 2.5625rem;
      margin-bottom: 0.5rem;
      max-width: 15.25rem;
    }
    div:last-child {
      height: 3.0625rem;
      max-width: 484px;
    }
  }

  &__right {
    display: flex;
    align-self: center;
    justify-content: flex-end;
    div {
      height: 3.0625rem;
      max-width: 242px;
    }
  }
}
.project-loading-options {
  display: flex;
  margin-top: 3rem;
  align-items: center;

  div:nth-child(2n) {
    &:first-child {
      margin-left: 7px;
    }
    margin-left: 15px;
    margin-right: 7px;
    width: 1.125rem;
    height: 1.125rem;
  }
}

.project-loading-grid {
  display: grid;
  place-items: center;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1rem;
  margin-top: 23px;

  div:first-child {
    width: 100%;
  }

  &__item {
    width: 100%;

    > div {
      display: flex;
      margin-bottom: 11px;
      div:first-child {
        margin-right: 15px;
      }
      div:last-child {
        margin-left: 5px;
      }
    }
    &__small {
      margin-top: 6px;
    }
  }
}
</style>
