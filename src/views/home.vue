<template>
  <div class="weni-home">
    <div v-show="!loading" class="weni-home__content unnnic-grid-giant">
      <div class="weni-home__welcome unnnic-grid-span-8">
        <emote class="weni-home__welcome__emote" />
        <div>
          <p class="weni-home__welcome__title">
            {{
              $t('home.welcome', {
                project: project.name,
                user: $store.state.Account.profile.first_name,
              })
            }}
          </p>
          <p v-show="$i18n.locale === 'en'" class="weni-home__welcome__subtitle"
            v-html="$t('home.time', {
            time: addMark(date.time),
            day: addMark(date.date) })" />
          <p v-show="$i18n.locale === 'pt-br'" class="weni-home__welcome__subtitle"
            v-html="$t('home.time', {
            hour: addMark(date.hour),
            minutes: addMark(date.minutes),
            day: addMark(date.date) })" />
        </div>
      </div>
      <news class="weni-home__info unnnic-grid-span-4" />
      <unnnic-card
        class="unnnic-grid-span-4"
        type="title"
        info-position="bottom"
        :title="$t('home.status_title')"
        scheme="aux-purple"
        :info="$t('home.status.info')" />
      <unnnic-card
        class="unnnic-grid-span-4"
        type="title"
        icon="graph-stats-ascend-2"
        :title="$t('home.growth_title')"
        info-position="bottom"
        scheme="aux-lemon"
        :info="$t('home.growth_info')" />
      <unnnic-card
        class="unnnic-grid-span-4"
        type="title"
        icon="task-list-clock-1"
        :title="$t('home.newsletter')"
        scheme="aux-orange"
        info-position="left"
        :info="$t('home.newsletter_info')" />
      <status @loadingStatus="getLoadingStatus" class="unnnic-grid-span-4" />
      <growth class="unnnic-grid-span-4" />
      <newsletter @loadingNews="getLoadingNews" class="unnnic-grid-span-4" />
    </div>
    <div v-show="loading">
      <skeleton-loading />
    </div>
  </div>
</template>

<script>
import Status from '../components/dashboard/status.vue';
import Growth from '../components/dashboard/growth.vue';
import Emote from '../components/Emote.vue';
import Newsletter from '../components/dashboard/newsletter.vue';
import News from '../components/dashboard/news.vue';
import SkeletonLoading from './loadings/dashboard';
import { mapGetters } from 'vuex';

export default {
  name: 'Home',
  components: {
    Status,
    Growth,
    Emote,
    Newsletter,
    News,
    SkeletonLoading,
  },
  data() {
    return {
      date: { date: '', time: '', hour: '', minutes: '' },
      organization: {},
      project: {},
      loadingStatus: false,
      loadingNews: false
    };
  },
  computed: {
    ...mapGetters(['getCurrentLanguage']),
    loading(){
      return this.loadingStatus || this.loadingNews;
    }
  },
    watch: {
      '$i18n.locale'() {
        this.getDate();
      },
      loading(){
        return this.loadingStatus || this.loadingNews
      }
  },

  created() {
    try {
      this.organization = JSON.parse(localStorage.getItem('org'));
      this.project = JSON.parse(localStorage.getItem('_project'));
    } catch (e) {
      console.log(e);
    }
  },

  mounted() {
    this.getDate();
    setInterval(() => { this.getDate(); }, 60 * 1000);
  },
  methods: {
    getDate() {
      const date = new Date();

      if(this.$i18n.locale === 'pt-br'){
        this.date.date = date.toLocaleString(this.$i18n.locale, {year: 'numeric', month: 'long', day: '2-digit'});
        this.date.hour = date.toLocaleString(this.$i18n.locale, {hour: 'numeric'})
        this.date.hour += 'h'
        this.date.minutes = date.toLocaleString(this.$i18n.locale, {minute: 'numeric'})
        console.log(this.date.day)
        return;
      }
      this.date.date = date.toLocaleString(this.$i18n.locale, {year: 'numeric', month: 'long', day: '2-digit'});
      this.date.time = date.toLocaleTimeString(this.$i18n.locale, {hour: '2-digit', minute:'2-digit'});
    },
    addMark(text) {
      return `<span class="weni-home__welcome__subtitle--token">${text}</span>`
    },
    getLoadingStatus(payload){
      this.loadingStatus = payload;
    },
    getLoadingNews(payload){
      this.loadingNews = payload;
    }
  }
}
</script>

<style lang="scss">
    @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

    .weni-home {
        background-color: $unnnic-color-background-snow;
        width: 100%;
        box-sizing: border-box;
        padding-top: $unnnic-spacing-stack-md;
        padding-bottom: $unnnic-spacing-stack-md;

        &__content {
          height: fit-content;
          align-items: flex-start;
        }

        &__info {
            background-color: $unnnic-color-neutral-lightest;
        }

        &__welcome {
            padding: $unnnic-inset-md;
            background-color: $unnnic-color-neutral-lightest;
            border-radius: $unnnic-border-radius-md;
            display: flex;
            align-items: center;
            box-sizing: border-box;

            &__emote {
                margin-right: $unnnic-inline-sm;
            }

            &__title {
                font-family: $unnnic-font-family-primary;
                font-size: $unnnic-font-size-title-sm;
                line-height: $unnnic-font-size-title-sm + $unnnic-line-height-medium;
                font-weight: $unnnic-font-weight-regular;
                margin: 0 0 $unnnic-spacing-stack-nano 0;
            }

            &__subtitle {
                font-family: $unnnic-font-family-secondary;
                font-size: $unnnic-font-size-body-gt;
                line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;
                font-weight: $unnnic-font-weight-regular;
                margin: 0;

                &--token {
                    color: $unnnic-color-brand-weni-soft;
                    font-weight: $unnnic-font-weight-bold;
                }
            }
        }
    }
</style>
