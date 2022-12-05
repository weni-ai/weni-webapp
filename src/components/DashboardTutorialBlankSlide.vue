<template>
  <tutorial-slider-container>
    <template slot="pages">
      <div class="page">
        <router-link
          :to="{
            name: 'push',
            params: {
              projectUuid: $store.getters.currentProject.uuid,
              internal: [
                'flow',
                'editor',
                $store.getters.currentProject.flow_uuid,
              ],
            },
          }"
        >
          <img src="@/assets/tutorial/fluxos-video.gif" />
        </router-link>

        <div class="title">{{ $t('home.started.know_the_project.title') }}</div>

        <div class="description">
          {{ $t('home.started.know_the_project.description') }}

          <a :href="urls.waDemoIntegration" target="_blank">
            {{ $t('know_more') }}
          </a>
        </div>
      </div>

      <div class="page">
        <router-link
          :to="{
            name: 'push',
            params: {
              projectUuid: $store.getters.currentProject.uuid,
              internal: [
                'flow',
                'editor',
                $store.getters.currentProject.flow_uuid,
              ],
            },
          }"
        >
          <img src="@/assets/tutorial/i.a-video.gif" />
        </router-link>

        <div class="title">{{ $t('home.started.add_intelligence.title') }}</div>

        <div class="description">
          {{ $t('home.started.add_intelligence.description') }}

          <a :href="urls.waDemoIntegration" target="_blank">
            {{ $t('know_more') }}
          </a>
        </div>
      </div>

      <div class="page">
        <router-link
          :to="{
            name: 'push',
            params: {
              projectUuid: $store.getters.currentProject.uuid,
              internal: [
                'flow',
                'editor',
                $store.getters.currentProject.flow_uuid,
              ],
            },
          }"
        >
          <img src="@/assets/tutorial/integração-video.gif" />
        </router-link>

        <div class="title">
          {{ $t('home.started.add_channel.title') }}
        </div>

        <div class="description">
          {{ $t('home.started.add_channel.description') }}

          <a :href="urls.waDemoIntegration" target="_blank">
            {{ $t('home.started.add_channel.how') }}
          </a>
        </div>
      </div>

      <div class="page">
        <router-link
          :to="{
            name: 'push',
            params: {
              projectUuid: $store.getters.currentProject.uuid,
              internal: [
                'flow',
                'editor',
                $store.getters.currentProject.flow_uuid,
              ],
            },
          }"
        >
          <img src="@/assets/tutorial/studio-video.gif" />
        </router-link>

        <div class="title">{{ $t('home.started.send_and_recieve.title') }}</div>

        <div class="description">
          {{ $t('home.started.send_and_recieve.description') }}

          <a :href="urls.waDemoIntegration" target="_blank">
            {{ $t('know_more') }}
          </a>
        </div>
      </div>

      <div class="page">
        <router-link
          :to="{
            name: 'push',
            params: {
              projectUuid: $store.getters.currentProject.uuid,
              internal: [
                'flow',
                'editor',
                $store.getters.currentProject.flow_uuid,
              ],
            },
          }"
        >
          <img src="@/assets/tutorial/chats.gif" />
        </router-link>

        <div class="title">{{ $t('home.started.config_chat.title') }}</div>

        <div class="description">
          {{ $t('home.started.config_chat.description') }}

          <a :href="urls.waDemoIntegration" target="_blank">
            {{ $t('home.started.config_chat.how') }}
          </a>
        </div>
      </div>
    </template>
  </tutorial-slider-container>
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
        waDemoIntegration: {
          en: 'https://docs.weni.ai/l/en/weni-integrations/how-to-create-a-channel-with-whats-app-demo',
          'pt-br':
            'https://docs.weni.ai/l/pt/m-dulo-integra-es/como-criar-um-canal-no-whats-app-demo',
        },
        flows: {
          en: 'https://docs.weni.ai/l/en/flows-category',
          'pt-br': 'https://docs.weni.ai/l/pt/fluxos',
        },
      };

      return {
        waDemoIntegration: get(
          urls,
          `waDemoIntegration.${this.$i18n.locale}`,
          urls.waDemoIntegration.en,
        ),
        flows: get(urls, `flows.${this.$i18n.locale}`, urls.flows.en),
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
