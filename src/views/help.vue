<template>
  <div class="help-container">
    <div class="header">
      <div class="title">Frequently Asked Questions</div>

      <div class="description">
        Your questions were not addressed in the questions below? Please contact our support via
        <a target="_blank" :href="`https://api.whatsapp.com/send?phone=${phone}`">WhatsApp</a>
        or email <b>suporte@weni.ai</b> <emoji name="Winking Face" />
      </div>
    </div>

    <div class="content">
      <div :style="{ height: 0 }">
        <unnnic-accordion
          v-for="(question, index) in questions"
          v-model="question.open"
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
            Watch the video
          </unnnic-button>

          <span v-html="question.content"></span>
        </unnnic-accordion>
      </div>
    </div>
  </div>
</template>

<script>
import Emoji from '../components/Emoji.vue';

export default {
  components: {
    Emoji,
  },

  data() {
    return {
      phone: '5582900000000',

      questions: [{
        title: 'Os valores permanecem os mesmos? O que muda no meu plano contratado?',
        content: 'Test',
        video: 'https://www.youtube.com/embed/D-pN2KeZu34',
        open: false,
      }, {
        title: 'Onde vou acessar para ver o novo Push e Bothub?',
        content: 'Quae assumenda aut non nulla quod ratione odio. Suscipit voluptatem natus a. Cumque et delectus ut. Nostrum ratione eos voluptatem voluptatu quia quod qui. Velit in consequatur corrupti similique. Quae assumenda aut non nulla quod ratione odio. Suscipit voluptatem natus a.',
        open: false,
      }],
    }
  },

  created() {
    this.questions = this.questions.concat(this.questions.slice());
    this.questions = this.questions.concat(this.questions.slice());
    this.questions = this.questions.concat(this.questions.slice());
    this.questions = this.questions.concat(this.questions.slice());
  },

  methods: {
    openVideo(video) {
      this.luigiClient.sendCustomMessage({
        id: 'open-modal',
        props: {
          type: 'youtube-video',
          data: {
            url: video,
          },
        },
      });
    },
  },
}
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

      a {
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
