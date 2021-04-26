<template>
  <div class="weni-home">
    <div class="weni-home__content unnnic-grid-giant">
      <div class="weni-home__welcome unnnic-grid-span-8">
        <emote class="weni-home__welcome__emote" />
        <div>
          <p class="weni-home__welcome__title">
            {{
              $t('home.welcome', {
                organization: organization.name,
                user: profile.first_name,
              })
            }}
          </p>
          <p class="weni-home__welcome__subtitle"
            v-html="$t('home.time', { 
            time: addMark(date.time), 
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
      <status class="unnnic-grid-span-4" />
      <growth class="unnnic-grid-span-4" />
      <newsletter class="unnnic-grid-span-4" />
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
      profile: {},
      organization: {},
    };
  },
  computed: { ...mapGetters(['getCurrentLanguage']) },
    watch: {
      getCurrentLanguage() {
        this.getDate();
      },
  },

  created() {
    try {
      this.profile = JSON.parse(localStorage.getItem('user'));
      this.organization = JSON.parse(localStorage.getItem('org'));
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
      this.date.date = date.toLocaleString(this.getCurrentLanguage, {year: 'numeric', month: '2-digit', day: '2-digit'});
      this.date.time = date.toLocaleTimeString(this.getCurrentLanguage, {hour: '2-digit', minute:'2-digit'});
    },
    addMark(text) {
      return `<span class="weni-home__welcome__subtitle--token">${text}</span>`
    }
  }
}
</script>

<style lang="scss">
    @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

    .weni-home {
        background-color: $unnnic-color-background-snow;
        width: 100%;
        min-height: 100vh;
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
                font-size: $unnnic-font-size-body-md;
                line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;
                font-weight: $unnnic-font-weight-regular;
                margin: 0;

                &--token {
                    color: $unnnic-color-brand-weni;
                    font-weight: $unnnic-font-weight-bold;
                }
            }
        }
    }
</style>