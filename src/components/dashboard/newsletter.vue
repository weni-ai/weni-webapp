<template>
  <div class="weni-newsletter">
    <div ref="content" class="weni-newsletter__content" @scroll="onScroll()">
      <div v-for="letter in newsletter" :key="letter.id" class="weni-newsletter__item">
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
      class="weni-newsletter__load-more unnnic--clickable"
      @click="getLetter()">
      <span v-if="loading"> <unnnic-icon icon="loading-circle-1" /> </span>
       <span v-else> ＋ {{ $t('home.show_more') }} </span>
      </div>
  </div>
</template>

<script>
import { unnnicIcon, unnnicCallAlert } from '@weni/unnnic-system';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import { mapActions, mapGetters } from 'vuex';

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
  components: { unnnicIcon },
  computed: {
    ...mapGetters(['getCurrentLanguage']),
  },
  mounted() {
    this.getLetter();
  },
  methods: {
    ...mapActions(['getNewsletterList']),
    timeAgo(time) {
      const date = new Date(time);
      return getTimeAgo(date, this.getCurrentLanguage).toUpperCase();
    },
    async getLetter() {
      this.loading = true;
      try {
        const response = await this.getNewsletterList({ page: this.page });
        this.newsletter = [...this.newsletter, ...response.data.results];
        this.hasMore = response.data.next !== null;
        if(this.hasMore) this.page = this.page + 1;
      } catch(e) {
        unnnicCallAlert({ props: {
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
      this.getLetter();
    },
  },
}
</script>

<style lang="scss" scoped>
    @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
    .weni-newsletter {
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        background-color: $unnnic-color-background-snow;
        border-radius: 8px;
        box-shadow: $unnnic-shadow-level-near;
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 100%;

        &__load-more {
          text-align: center;
          color: $unnnic-color-neutral-cloudy;
          padding: $unnnic-inset-md 0;
        }

        &__content {
            max-height: 68vh;
            overflow-y: auto;
            flex: 1;

            > :first-child {
              padding-top: $unnnic-spacing-stack-lg;
            }
        }

        &__item {
            display: flex;
            align-items: center;
            padding: 0 $unnnic-inset-md $unnnic-spacing-stack-lg $unnnic-inset-md;

            &__title {
                color: $unnnic-color-neutral-cloudy;

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
                  color: $unnnic-color-neutral-cloudy;
                  font-size: 8px;
                }
            }

            &__subtitle {
                color: $unnnic-color-neutral-darkest;
                margin: 0;
            }
        }
    }

ul li::marker {
    color: $unnnic-color-aux-lemon;
    font-size: 0.25rem;
}

</style>