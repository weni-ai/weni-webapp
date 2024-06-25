<template>
  <TutorialSliderContainer>
    <template slot="pages">
      <div class="page">
        <RouterLink
          :to="{
            name: 'academy',
            params: {
              internal: 'r/module/1/category/1/class/13'.split('/'),
            },
          }"
        >
          <img src="@/assets/tutorial/fluxos-video.gif" />
        </RouterLink>

        <div class="title">{{ $t('home.started.create_flow.title') }}</div>

        <div class="description">
          {{ $t('home.started.create_flow.description') }}

          <RouterLink
            :to="{
              name: 'academy',
              params: {
                internal: 'r/module/1/category/1/class/13'.split('/'),
              },
            }"
          >
            {{ $t('know_more') }}
          </RouterLink>
        </div>
      </div>

      <div class="page">
        <RouterLink
          :to="{
            name: 'academy',
            params: {
              internal: 'r/module/1/category/2/class/19'.split('/'),
            },
          }"
        >
          <img src="@/assets/tutorial/i.a-video.gif" />
        </RouterLink>

        <div class="title">{{ $t('home.started.add_intelligence.title') }}</div>

        <div class="description">
          {{ $t('home.started.add_intelligence.description') }}

          <RouterLink
            :to="{
              name: 'academy',
              params: {
                internal: 'r/module/1/category/2/class/19'.split('/'),
              },
            }"
          >
            {{ $t('know_more') }}
          </RouterLink>
        </div>
      </div>

      <div class="page">
        <RouterLink
          :to="{
            name: 'academy',
            params: {
              internal: 'r/module/1/category/3'.split('/'),
            },
          }"
        >
          <img src="@/assets/tutorial/integração-video.gif" />
        </RouterLink>

        <div class="title">
          {{ $t('home.started.add_channel.title') }}
        </div>

        <div class="description">
          {{ $t('home.started.add_channel.description') }}

          <RouterLink
            :to="{
              name: 'academy',
              params: {
                internal: 'r/module/1/category/3'.split('/'),
              },
            }"
          >
            {{ $t('home.started.add_channel.how') }}
          </RouterLink>
        </div>
      </div>

      <div class="page">
        <RouterLink
          :to="{
            name: 'academy',
            params: {
              internal: 'r/module/1/category/1/class/10'.split('/'),
            },
          }"
        >
          <img src="@/assets/tutorial/studio-video.gif" />
        </RouterLink>

        <div class="title">{{ $t('home.started.send_and_recieve.title') }}</div>

        <div class="description">
          {{ $t('home.started.send_and_recieve.description') }}

          <RouterLink
            :to="{
              name: 'academy',
              params: {
                internal: 'r/module/1/category/1/class/10'.split('/'),
              },
            }"
          >
            {{ $t('know_more') }}
          </RouterLink>
        </div>
      </div>

      <div class="page">
        <a
          :href="urls.chats"
          target="_blank"
        >
          <img src="@/assets/tutorial/chats.gif" />
        </a>

        <div class="title">{{ $t('home.started.config_chat.title') }}</div>

        <div class="description">
          {{ $t('home.started.config_chat.description') }}

          <a
            :href="urls.chats"
            target="_blank"
          >
            {{ $t('home.started.config_chat.how') }}
          </a>
        </div>
      </div>
    </template>
  </TutorialSliderContainer>
</template>

<script>
import { get } from 'lodash';
import TutorialSliderContainer from './TutorialSliderContainer.vue';

export default {
  components: {
    TutorialSliderContainer,
  },

  computed: {
    urls() {
      const urls = {
        chats: {
          en: 'https://docs.weni.ai/l/pt/atendimento-humano/weni-chats-configurando-o-m-dulo-de-chats',
          'pt-br':
            'https://docs.weni.ai/l/pt/atendimento-humano/weni-chats-configurando-o-m-dulo-de-chats',
        },
      };

      return {
        chats: get(urls, `chats.${this.$i18n.locale}`, urls.chats.en),
      };
    },
  },

  methods: {
    open(src) {
      window.open(src);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
</style>
