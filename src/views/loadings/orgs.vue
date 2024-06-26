<template>
  <div class="orgs-loading-container unnnic-grid-lg">
    <div class="orgs-loading-container__left unnnic-grid-span-5">
      <UnnnicSkeletonLoading
        tag="div"
        width="56px"
        height="56px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="274px"
        height="46px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="100%"
        height="43px"
      />
      <UnnnicSkeletonLoading
        tag="div"
        width="243px"
        height="52px"
      />
    </div>
    <div class="unnnic-grid-span-2"></div>
    <div class="orgs-loading-container__right unnnic-grid-span-5">
      <div
        v-for="n in 3"
        :key="n"
      >
        <div>
          <UnnnicSkeletonLoading
            tag="div"
            width="100%"
            height="32px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="100%"
            height="19px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="100%"
            height="19px"
          />

          <div>
            <UnnnicSkeletonLoading
              tag="div"
              width="64px"
              height="24px"
            />
            <UnnnicSkeletonLoading
              tag="div"
              width="211px"
              height="24px"
            />
          </div>
        </div>
        <div>
          <UnnnicSkeletonLoading
            tag="div"
            width="73px"
            height="38px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="17px"
            height="38px"
          />
        </div>
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
.orgs-loading-container {
  &__left {
    display: flex;
    flex-direction: column;
    justify-content: center;

    > div:nth-child(1) {
      margin-bottom: 24px;
    }
    > div:nth-child(2) {
      margin-bottom: 7px;
    }
    > div:nth-child(3) {
      margin-bottom: 21px;
    }
  }

  &__right {
    > div {
      display: flex;
      height: fit-content;

      > div:first-child {
        flex: 1;
      }

      &:not(:first-child) {
        margin-top: 56px;
      }
      > div:first-child {
        > div:nth-child(1),
        div:nth-child(2) {
          margin-bottom: 4px;
        }

        > div:nth-child(4) {
          margin-top: 26px;
          display: flex;
          > div:first-child {
            margin-right: 4px;
          }
        }
      }

      > div:last-child {
        margin-left: 8px;
        display: flex;
        align-items: center;
        > div:first-child {
          margin-right: 4px;
        }
      }
    }
  }
}
</style>
