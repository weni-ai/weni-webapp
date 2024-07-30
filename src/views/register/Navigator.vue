<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="pages">
    <div
      v-for="page in pages"
      :key="page"
      :class="[
        'page',
        {
          'page--before': pages
            .slice(0, pages.indexOf(activePage))
            .includes(page),
          'page--current': activePage == page,
        },
      ]"
    >
      <div class="page__fill"></div>

      <div
        :class="[
          'page__title',
          {
            'page__title--active': activePage === page,
          },
        ]"
      >
        {{ $t(`register.pages.${page}`) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pages: Array,
    activePage: String,
  },
};
</script>

<style lang="scss" scoped>


.pages {
  display: flex;
  column-gap: $unnnic-spacing-xs;

  .page {
    width: 100%;
    max-width: 6.25rem;
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-nano;

    &__fill {
      height: 0.5rem;
      width: 100%;
      background-color: $unnnic-color-weni-100;
      border-radius: $unnnic-border-radius-pill;
    }

    &__title {
      text-align: center;

      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      color: $unnnic-color-neutral-clean;
    }

    @media screen and (max-width: 480px) {
      max-width: 3.75rem;

      &__title {
        display: none;
      }
    }

    &--current,
    &--before {
      .page__fill {
        background-color: $unnnic-color-weni-600;
      }
    }

    &--current {
      .page__title {
        color: $unnnic-color-weni-700;
        font-weight: $unnnic-font-weight-bold;
      }
    }
  }
}
</style>
