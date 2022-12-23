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
          <img src="@/assets/tutorial/26cc1e0dfa69ae05d7702e0c8fac4124.gif" />
        </router-link>

        <div class="title">
          {{ $t('home.started.know_the_project.title') }}
        </div>

        <div class="description">
          {{
            $t(
              `home.started.know_the_project.${
                $store.getters.currentProject.project_type.split(':')[1] ||
                'lead_capture'
              }.description`,
            )
          }}

          <a :href="urls.waDemoIntegration" target="_blank">
            {{ $t('know_more') }}
          </a>
        </div>
      </div>

      <div class="page">
        <a :href="$store.getters.currentProject.redirect_url" target="_blank">
          <img src="@/assets/tutorial/0751c8d5aa810887af7a259847a9ef76.gif" />
        </a>

        <div class="title">
          {{ $t('home.started.whatsapp.title') }}
        </div>

        <div class="whatsapp">
          <qr-code
            class="qr-code-whatsapp-link"
            :text="$store.getters.currentProject.redirect_url"
          ></qr-code>

          <div class="input">
            {{ $store.getters.currentProject.redirect_url }}

            <unnnic-button-icon
              type="secondary"
              size="small"
              icon="export-1"
              @click="open($store.getters.currentProject.redirect_url)"
            />
          </div>
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
          <img src="@/assets/tutorial/ce4a1085efff76433c5a0942e2f2d813.gif" />
        </router-link>

        <div class="title">
          {{ $t('home.started.flows.title') }}
        </div>

        <div class="description">
          {{ $t('home.started.flows.description') }}

          <a :href="urls.flows" target="_blank">{{ $t('know_more') }}</a>
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

.whatsapp {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-inline-xs;

  .qr-code-whatsapp-link {
    width: 75px;
    height: 75px;

    ::v-deep img {
      width: 75px;
      height: 75px;
      border: 3px solid #ffffff;
      box-sizing: border-box;
    }
  }

  .input {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-inline-xs;
    justify-content: space-between;
    padding: $unnnic-squish-xs;
    border-radius: $unnnic-border-radius-sm;
    outline-style: solid;
    outline-color: $unnnic-color-neutral-soft;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;
    font-family: $unnnic-font-family-secondary;
    color: $unnnic-color-neutral-cloudy;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
