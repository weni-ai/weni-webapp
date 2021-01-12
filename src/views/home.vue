<template>
  <div class="weni-home">
    <div class="weni-home__content unnic-grid-giant">
      <div class="weni-home__welcome unnic-grid-span-8">
        <emote class="weni-home__welcome__emote" />
        <div>
          <p class="weni-home__welcome__title">  {{ $t('home.welcome') }}, <span v-if="profile"> {{ profile.first_name }} </span>  </p>
          <p class="weni-home__welcome__subtitle"
            v-html="$t('home.time', { 
            time: addMark(date.time), 
            day: addMark(date.date) })" />
        </div>
      </div>
      <news class="weni-home__info unnic-grid-span-4" />
      <unnic-card
        class="unnic-grid-span-4"
        type="title"
        :title="$t('home.status_title')"
        scheme="aux-purple"
        :info="$t('home.status.info')" />
      <unnic-card
        class="unnic-grid-span-4"
        type="title"
        icon="graph-stats-ascend-2"
        :title="$t('home.growth')"
        info-position="bottom"
        scheme="aux-lemon"
        :info="$t('home.growth_info')" />
      <unnic-card
        class="unnic-grid-span-4"
        type="title"
        icon="task-list-clock-1"
        :title="$t('home.newsletter')"
        scheme="aux-orange"
        info-position="left"
        :info="$t('home.newsletter_info')" />
      <status class="unnic-grid-span-4" />
      <growth class="unnic-grid-span-4" />
      <newsletter class="unnic-grid-span-4" />
    </div>
  </div>
</template>

<script>
import Status from '../components/dashboard/status.vue';
import Growth from '../components/dashboard/growth.vue';
import Emote from '../components/Emote.vue';
import Newsletter from '../components/dashboard/newsletter.vue';
import News from '../components/dashboard/news.vue';
import { mapGetters } from 'vuex';
import account from '../api/account.js';

export default {
  name: 'Home',
  components: {
    Status,
    Growth,
    Emote,
    Newsletter,
    News,
  },
  data() {
    return {
      date: { date: '', time: '' },
      profile: null,
    };
  },
  computed: { ...mapGetters(['getCurrentLanguage']) },
    watch: {
      getCurrentLanguage() {
        this.getDate();
      },
  },
  mounted() {
    this.getDate();
    this.getProfile();
    setInterval(() => { this.getDate(); }, 60 * 1000);
  },
  methods: {
    getDate() {
      const date = new Date();
      console.log(this.getCurrentLanguage);
      this.date.date = date.toLocaleString(this.getCurrentLanguage, {year: 'numeric', month: '2-digit', day: '2-digit'});
      this.date.time = date.toLocaleTimeString(this.getCurrentLanguage, {hour: '2-digit', minute:'2-digit'});
    },
    async getProfile() {
      const response = await account.profile();
      this.profile = response.data;
    },
    addMark(text) {
      return `<span class="weni-home__welcome__subtitle--token">${text}</span>`
    }
  }
}
</script>

<style lang="scss">
    @import '~unnic-system-beta/dist/unnic.css';
    @import '~unnic-system-beta/src/assets/scss/unnic.scss';

    .weni-home {
        background-color: $unnic-color-background-snow;
        width: 100%;
        min-height: 100vh;
        box-sizing: border-box;
        padding-top: 16px;
        padding-bottom: 16px;

        &__info {
            background-color: $unnic-color-neutral-lightest;
        }

        &__welcome {
            padding: $unnic-inset-md;
            background-color: $unnic-color-neutral-lightest;
            border-radius: $unnic-border-radius-md;
            display: flex;
            align-items: center;
            box-sizing: border-box;

            &__emote {
                margin-right: $unnic-inline-sm;
            }

            &__title {
                font-family: $unnic-font-family-primary;
                font-size: $unnic-font-size-title-sm;
                line-height: $unnic-font-size-title-sm + $unnic-line-height-medium;
                font-weight: $unnic-font-weight-regular;
                margin: 0 0 $unnic-spacing-stack-nano 0;
            }

            &__subtitle {
                font-family: $unnic-font-family-secondary;
                font-size: $unnic-font-size-body-md;
                line-height: $unnic-font-size-body-md + $unnic-line-height-medium;
                font-weight: $unnic-font-weight-regular;
                margin: 0;

                &--token {
                    color: $unnic-color-brand-weni;
                }
            }
        }
    }
</style>