<template>
  <div class="help-container">
    <div class="header">
      <div class="title">{{ $t('faq.title') }}</div>

      <div class="description">
        <span v-html="$t('faq.description', { phone })"></span>
        <emoji name="Winking Face" />
      </div>
    </div>

    <div class="content">
      <div :style="{ height: 0 }">
        <unnnic-accordion
          v-for="(question, index) in questions"
          v-model="opens[question.key]"
          :key="index"
          :title="question.title"
          class="question"
        >
          <unnnic-button
            v-if="question.video"
            @click.stop="openVideo(question.video)"
            slot="actions"
            type="secondary"
            size="small"
            icon-left="button-play-1"
          >
            {{ $t('faq.questions.watch_video') }}
          </unnnic-button>

          <dynamic :template="`<span>${question.content}</span>`"></dynamic>
        </unnnic-accordion>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapActions } from 'vuex';
import Emoji from '../components/Emoji.vue';

const dynamic = {
  props: ['template'],
  components: {
    Emoji,
  },
  data() {
    return {
      templateRender: null,
    };
  },
  render() {
    return this.templateRender();
  },
  watch: {
    template: {
      immediate: true,
      handler() {
        const res = Vue.compile(this.template);

        this.templateRender = res.render;

        this.$options.staticRenderFns = [];

        this._staticTrees = [];

        for (let i in res.staticRenderFns) {
          this.$options.staticRenderFns.push(res.staticRenderFns[i]);
        }
      },
    },
  },
};

export default {
  components: {
    Emoji,
    dynamic,
  },

  data() {
    return {
      phone: '+ 55 (82) 3022-5978',

      opens: {
        will_the_price_change: false,
        did_push_and_bothub_change_name: false,
        how_can_i_access_the_new_push_and_bothub: false,
        will_my_chatbot_suffer_any_impact_with_this_change: false,
        will_any_functionality_change: false,
        what_will_i_find_about_new_benefits: false,
        is_it_possible_i_lose_any_data_from_my_chatbot: false,
        will_my_integrations_be_affected: false,
        do_my_permissions_remain_the_same: false,
        how_and_who_do_i_ask_for_help: false,
      },
    };
  },

  computed: {
    questions() {
      return [
        {
          key: 'will_the_price_change',
        },
        {
          key: 'did_push_and_bothub_change_name',
          hasVideo: true,
        },
        {
          key: 'how_can_i_access_the_new_push_and_bothub',
          hasVideo: true,
        },
        {
          key: 'will_my_chatbot_be_impacted_by_this_change',
        },
        {
          key: 'will_any_functionality_change',
          hasVideo: true,
        },
        {
          key: 'what_will_i_find_about_new_benefits',
          hasVideo: true,
        },
        {
          key: 'is_it_possible_i_lose_any_data_from_my_chatbot',
        },
        {
          key: 'will_my_integrations_be_affected',
        },
        {
          key: 'do_my_permissions_remain_the_same',
          hasVideo: true,
        },
        {
          key: 'how_and_who_do_i_ask_for_help',
          content: ``,
        },
      ].map((question) => ({
        ...question,
        title: this.$t(`faq.questions.${question.key}.title`),
        content: this.$t(`faq.questions.${question.key}.answer`, {
          phone: this.phone,
        }),
        video: question.hasVideo
          ? this.$t(`faq.questions.${question.key}.video`)
          : null,
      }));
    },
  },

  methods: {
    ...mapActions(['openModal']),

    openVideo(video) {
      this.openModal({
        type: 'youtube-video',
        data: {
          url: video,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.help-container {
  padding: $unnnic-spacing-inset-md;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .header {
    padding: $unnnic-inset-lg;
    margin-bottom: $unnnic-spacing-stack-sm;
    background-color: $unnnic-color-background-sky;
    border-radius: $unnnic-border-radius-md;
    background-image: url('../assets/banner/Background-FAQ.svg');
    background-repeat: no-repeat;
    background-size: auto 100%;

    .title {
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-title-md;
      line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
      color: $unnnic-color-neutral-black;

      margin-bottom: $unnnic-spacing-stack-xs;
    }

    .description {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      color: $unnnic-color-neutral-cloudy;

      ::v-deep a {
        font-weight: bold;
        color: inherit;
      }
    }
  }

  .content {
    $scroll-size: $unnnic-inline-nano;

    flex: 1;
    overflow: overlay;
    min-height: 8rem;

    padding-right: calc(#{$unnnic-inline-xs} + #{$scroll-size});
    width: 100%;

    ::v-deep a {
      color: inherit;
    }

    .question:not(:last-child) {
      margin-bottom: $unnnic-spacing-stack-sm;
    }

    &::-webkit-scrollbar {
      width: $scroll-size;
    }

    &::-webkit-scrollbar-thumb {
      background: $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    &::-webkit-scrollbar-track {
      background: $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-pill;
    }
  }
}
</style>
