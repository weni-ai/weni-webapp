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

        <div class="title">Conheça o projeto que preparamos para você!</div>

        <div class="description">
          Esta opção oferece o fluxo de mensagens para atendimento ao seu
          cliente, aqui você já tem seu projeto integrado ao WhatsApp Demo.

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

        <div class="title">Adicione inteligência ao seu projeto</div>

        <div class="description">
          Você pode criar suas próprias inteligências artificiais para
          entendimento de linguagem natural, além de acessar, utilizar e evoluir
          inteligências já construídas por outros usuários da comunidade!

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

        <div class="title">Adicionando um canal</div>

        <div class="description">
          Para facilitar e agilizar o atendimento de seus clientes, a Weni
          permite que você faça integrações com seu chatbot, de forma rápida e
          fácil, em mais de um tipo de canal de comunicação.

          <a :href="urls.waDemoIntegration" target="_blank">
            Como Integrar um canal
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

        <div class="title">Como enviar e receber mensagens</div>

        <div class="description">
          A plataforma permite que você envie e receba mensagens, assim com
          agenda-las para que sejam enviadas em uma data e hora determinadas e
          repita diariamente, semanalmente ou mensalmente.

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

        <div class="title">Configurando seu chat</div>

        <div class="description">
          Agora você pode realizar atendimento dentro da plataforma Weni.
          Adicione, visualize e gerencie os setores, filas, gestores e agentes
          dentro da sua organização.

          <a :href="urls.waDemoIntegration" target="_blank">
            Quero configurar meu chat
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
