<template>
  <div class="weni-newsletter">
    <div ref="content" class="weni-newsletter__content" @scroll="onScroll()">
      <div v-for="letter in newsletter" :key="letter.id" class="weni-newsletter__item">
        <div class="weni-newsletter__bullet" />
        <div class="weni-newsletter__item__title__container">
          <div class="weni-newsletter__item__title__wrapper">
            <p class="weni-newsletter__item__title"> {{ letter.title }} </p>
            <p :key="getCurrentLanguage" class="weni-newsletter__item__title__time"> {{ timeAgo(letter.created_at) }} </p>
          </div>
          <p class="weni-newsletter__item__subtitle"> {{ letter.description }} </p>
       </div>
      </div>
    </div>
    <div
      v-if="hasMore"
      class="weni-newsletter__load-more unnic--clickable"
      @click="getLetter()">
      <span v-if="loading"> <unnic-icon icon="loading-circle-1" /> </span>
       <span v-else> ＋ {{ $t('home.show_more') }} </span>
      </div>
  </div>
</template>

<script>
import unnic from 'unnic-system-beta';
import dashboard from '../../api/dashboard.js';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import { mapGetters } from 'vuex';

export default {
  name: 'Newsletter',
    data() {
      return {
        newsletter: [],
        page: 1,
        hasMore: true,
        loading: false,
    };
  },
  components: { UnnicIcon: unnic.UnnicIcon },
  computed: {
    ...mapGetters(['getCurrentLanguage']),
  },
  mounted() {
    this.getLetter();
  },
  methods: {
    timeAgo(time) {
      const date = new Date(time);
      return getTimeAgo(date, this.getCurrentLanguage).toUpperCase();
    },
    async getLetter() {
      this.loading = true;
      try {
        const response = await dashboard.newsletterList(this.page);
        this.newsletter = [...this.newsletter, ...response.data.results];
        this.hasMore = response.data.next !== null;
        if(this.hasMore) this.page = this.page + 1;
      } catch(e) {
        unnic.callAlert({ props: {
          text: this.$t('home.news_error'),
          title: 'Error',
          icon: 'check-circle-1-1',
          scheme: 'feedback-red',
          position: 'bottom-right',
          closeText: this.$t('close'),
        }, seconds: 3 });
      } finally {
        this.loading = false;
      }
    },
    async onScroll() {
      if (!this.hasMore) return;
      const element = this.$refs.content;
      if (this.loading || (element.scrollHeight - element.scrollTop) < element.clientHeight + 43) return;
      // console.log('on finish', element.scrollHeight, element.scrollTop, element.clientHeight);
      this.getLetter();
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
        height: 100%;
        max-width: 100%;

        &__load-more {
          text-align: center;
          color: $unnic-color-neutral-cloudy;
          padding: $unnic-inset-md 0;
        }

        &__content {
            max-height: 68vh;
            overflow-y: auto;
            flex: 1;

            > :first-child {
              padding-top: $unnic-spacing-stack-lg;
            }
        }

        &__bullet {
          background-color: $unnic-color-aux-lemon;
          min-height: 0.25rem;
          min-width: 0.25rem;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        &__item {
            display: flex;
            align-items: center;
            padding: 0 $unnic-inset-md $unnic-spacing-stack-lg $unnic-inset-md;

            &__title {
                color: $unnic-color-neutral-cloudy;

                &__container {
                  width: 100%;
                }

                &__wrapper {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;

                  p {
                    margin: 0;
                  }
                }

                &__time {
                  color: $unnic-color-neutral-cloudy;
                  font-size: 8px;
                }
            }

            &__subtitle {
                color: $unnic-color-neutral-darkest;
                margin: 0;
            }
        }
    }

ul li::marker {
    color: $unnic-color-aux-lemon;
    font-size: 0.25rem;
}

</style>