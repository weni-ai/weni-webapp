<template>
  <div class="weni-newsletter">
    <div
      ref="content"
      class="weni-newsletter__content"
      @scroll="onScroll()"
    >
      <div
        v-for="letter in newsletter"
        :key="letter.id"
        class="weni-newsletter__item"
      >
        <div class="weni-newsletter__item__title__container">
          <div class="weni-newsletter__item__title__wrapper">
            <p class="weni-newsletter__item__title">{{ letter.title }}</p>
            <p
              :key="profile.language"
              class="weni-newsletter__item__title__time"
            >
              {{ timeAgo(letter.created_at) }}
            </p>
          </div>
          <p class="weni-newsletter__item__subtitle">
            {{ letter.description }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-if="hasMore"
      class="weni-newsletter__load-more unnnic--clickable"
      @click="getLetter()"
    >
      <span v-if="loading">
        <UnnnicIconSvg
          icon="loading-circle-1"
          scheme="neutral-cloudy"
        />
      </span>
      <span v-else> ＋ {{ $t('home.show_more') }} </span>
    </div>
  </div>
</template>

<script>
import Unnnic from '@weni/unnnic-system';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Newsletter',
  data() {
    return {
      newsletter: [],
      page: 1,
      hasMore: true,
      loading: false,
    };
  },
  computed: {
    ...mapState({
      profile: (state) => state.Account.profile,
    }),

    ...mapGetters(['currentProject']),
  },

  watch: {
    'profile.language'() {
      this.newsletter = [];
      this.page = 1;
      this.hasMore = true;
      this.loading = false;
      this.getLetter();
    },
    loading() {
      this.$emit('loadingNews', this.loading);
    },
  },

  mounted() {
    this.getLetter();
  },
  methods: {
    ...mapActions(['getNewsletterList']),
    timeAgo(time) {
      const date = new Date(time);
      return getTimeAgo(date, this.profile.language).toUpperCase();
    },
    async getLetter() {
      this.loading = true;
      try {
        const response = await this.getNewsletterList({
          page: this.page,
          projectUuid: this.currentProject.uuid,
        });
        this.newsletter = [...this.newsletter, ...response.data.results];
        this.hasMore = response.data.next !== null;
        if (this.hasMore) this.page = this.page + 1;
      } catch (e) {
        Unnnic.unnnicCallAlert({
          props: {
            text: this.$t('home.news_error'),
            title: 'Error',
            icon: 'check_circle',
            scheme: 'feedback-red',
            position: 'bottom-right',
            closeText: this.$t('close'),
          },
          seconds: 3,
        });
      } finally {
        this.loading = false;
      }
    },
    async onScroll() {
      if (!this.hasMore) return;
      const element = this.$refs.content;
      if (
        this.loading ||
        element.scrollHeight - element.scrollTop < element.clientHeight + 43
      )
        return;
      this.getLetter();
    },
  },
};
</script>

<style lang="scss" scoped>
.weni-newsletter {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  background-color: $unnnic-color-background-snow;
  border-radius: 8px;
  box-shadow: $unnnic-shadow-level-far;
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
