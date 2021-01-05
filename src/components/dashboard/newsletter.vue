<template>
  <div class="weni-newsletter">
    <div class="weni-newsletter__content">
      <div v-for="letter in newsletter" :key="letter.id" class="weni-newsletter__item">
        <div class="weni-newsletter__bullet" />
        <div>
          <p class="weni-newsletter__item__title"> {{ letter.title }} </p>
          <p class="weni-newsletter__item__subtitle"> {{ letter.description }} </p>
       </div>
      </div>
    </div>
    <div
      v-if="!loading && hasMore"
      class="weni-newsletter__load-more unnic--clickable"
      @click="getLetter()">
       ＋ Mostrar mais
      </div>
  </div>
</template>

<script>
import dashboard from '../../api/dashboard.js';
export default {
  name: 'Newsletter',
    data() {
      return {
        newsletter: [],
        page: 1,
        hasMore: false,
        loading: false,
    };
  },
  mounted() {
    this.getLetter();
  },
  methods: {
    async getLetter() {
      this.loading = true;
      try {
        const response = await dashboard.newsletterList(this.page, 1);
        this.newsletter = [...this.newsletter, ...response.data.results];
        this.hasMore = response.data.next !== null;
        if(this.hasMore) this.page = this.page + 1;
      } finally {
        this.loading = false;
      }
    },
  },
}
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnic.scss';
    .weni-newsletter {
        font-family: $unnic-font-family-secondary;
        font-size: $unnic-font-size-body-md;
        background-color: $unnic-color-background-snow;
        border-radius: 8px;
        box-shadow: $unnic-shadow-level-near;
        display: flex;
        flex-direction: column;

        &__load-more {
          text-align: center;
          color: $unnic-color-neutral-cloudy;
          padding: $unnic-inset-md 0;
        }

        &__content {
            max-height: 70vh;
            overflow-y: auto;
            flex: 1;
        }

        &__bullet {
          background-color: $unnic-color-aux-lemon;
          min-height: 0.5rem;
          min-width: 0.5rem;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        &__item {
            display: flex;
            align-items: center;
            padding: 0 $unnic-inset-md $unnic-spacing-stack-lg $unnic-inset-md;
            &__title {
                color: $unnic-color-neutral-cloudy;
                margin: 0;
            }

            &__subtitle {
                color: $unnic-color-neutral-darkest;
                margin: 0;
            }
        }
    }

ul li::marker {
    color: $unnic-color-aux-lemon;
    font-size: 0.5rem;
}

</style>