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

          <dynamic :template="`<span>${question.content}</span>`"></dynamic>
        </unnnic-accordion>
      </div>
    </div>
  </div>
  
</template>

<script>
import Vue from 'vue';
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
    template:{
      immediate: true,
      handler() {
        const res = Vue.compile(this.template);

        this.templateRender = res.render;

        this.$options.staticRenderFns = [];

        this._staticTrees = []

        for (let i in res.staticRenderFns) {
          this.$options.staticRenderFns.push(res.staticRenderFns[i])
        }
      }
    }
  },
};

export default {
  components: {
    Emoji,
    dynamic,
  },

  data() {
    return {
      phone: '5582900000000',

      questions: [{
        title: 'Haverá alguma mudança no plano que contratei? Os valores continuarão os mesmos?',
        content: `Não se preocupe! <b>Você continua tendo todos os direitos acordados anteriormente e pagando pelos contatos ativos.</b>
<br><br>
Todas as mudanças no nosso produto têm sido construídas para entregar a melhor experiência possível à sua organização e ao seu público, com nenhum custo adicional para você.`,
        open: false,
      }, {
        title: 'Os sistemas Push e Bothub mudaram de nome?',
        content: `Sim! Agora nós disponibilizamos uma plataforma unificada que oferece ainda mais autonomia, segurança e conectividade. Na <b>Weni Plataforma</b>, todos os sistemas estão conectados em uma só interface, com os mesmos longins e painel de controle.
<br><br>
<b>Sendo assim, Push, Bothub e Rocket.chat tornam-se módulos chamados respectivamente de Fluxos, Inteligência Artificial e Agentes.</b>`,
        video: 'https://www.youtube.com/embed/D-pN2KeZu34',
        open: false,
      }, {
        title: 'Como acesso os novos Push e Bothub?',
        content: `A Weni Plataforma é acessada por meio de <a @click.stop target="_blank" href="https://weni.ai">weni.ai</a></b>. E é lá que estão os módulos de Fluxos e Inteligência Artificial.
<br><br>
Você também pode acessar diretamente pela URL da plataforma em <a @click.stop target="_blank" href="https://dash.weni.ai">dash.weni.ai</a>.`,
        video: 'https://www.youtube.com/embed/D-pN2KeZu34',
        open: false,
      }, {
        title: 'Meu chatbot vai ser impactador com essa mudança?',
        content: `<b>De forma alguma!</b> <emoji name="Winking Face" /> Você continuará desenhando e personalizando seus chatbots como antes. <b>Será mantido tudo aquilo que você construiu, bem como as funcionalidades que você já conhece.</b>
<br><br>
Não haverá necessidade de grandes curvas de aprendizado. Inclusive, a reunião dos sistemas em <b>uma única plataforma vai te permitir usufriir de todo o poder das tecnologias Weni de um jeito ainda mais simplificado e com menos possibilidades de bugs.</b>`,
        open: false,
      }, {
        title: 'Alguma funcionalidade mudará?',
        content: `<b>Apenas a forma como estruturamos as “Organizações (Orgs)”.</b>

As Orgs criadas no Bothub foram migradas para a Weni Plataforma e aquelas que foram desenvolvidas no Push viraram projetos que estão dentro de Orgs.`,
        video: 'https://www.youtube.com/embed/D-pN2KeZu34',
        open: false,
      }, {
        title: 'O que vou encontrar de novos benefícios na Weni Plataforma?',
        content: `<ul>
  <li><b>Notificações sobre o status do sistema:</b> caso estejamos passando por alguma instabilidade nos módulos, consulte Início > Status do Sistema;</li>
  <li><b>Campo de pesquisa:</b> encontre fluxos do projeto e inteligências da comunidade;</li>
  <li><b>Troca fácil de idioma:</b> mude rapidamente o idioma do seu chatbot no Menu do Sistema;</li>
  <li><b>Aviso de atualizações:</b> fique por dentro das novas funcionalidades da Weni em Início > Últimas Atualizações.</li>
</ul>`,
        video: 'https://www.youtube.com/embed/D-pN2KeZu34',
        open: false,
      }, {
        title: 'É possível que eu perca algum dado do meu chatbot?',
        content: `<b>Nenhum dado será perdido.</b> A migração tem sido executada gradualmente e com todo o cuidado preciso para que nada se perca no caminho.`,
        open: false,
      }, {
        title: 'Mihas integrações via API serão afetadas?',
        content: `<b>As integrações que você escolheu estão mantidas</b> e estamos trabalhando muito para que sejam cada vez mais eficientes e simples de serem feitas.`,
        open: false,
      }, {
        title: 'Minhas permissões continuam as mesmas?',
        content: `Passamos a ter somente <b>três níveis de permissão:</b>
<ul>
  <li><b>Contribuidor(a)</b> cria e edita fluxos e inteligências. Não tem acesso a dados sensíveis;</li>
  <li><b>Visualizador(a)</b> so tem autorização para visualizar os projetos;</li>
  <li><b>Administrador(a)</b> tem acesso a tudo o que consta na plataforma. Isso inclui, por exemplo, os dados de pagamento e gestão de membros.</li>
</ul>
→ Vale ressaltar que essas <b>permissões são atribuídas à uma Org</b> e servem para todos os projetos dela, além de todos os módulos.`,
        video: 'https://www.youtube.com/embed/D-pN2KeZu34',
        open: false,
      }, {
        title: 'Se eu tiver algum problema na plataforma ou qualquer dúvida, como e para quem solicito ajuda?',
        content: `É só entrar em contato com o nosso Time de Suporte através do (82) 3022-5978 ou mandar uma mensagem para <a @click.stop target="_blank" href="atendiment.weni.ai">atendiment.weni.ai</a>.`,
        open: false,
      }],
    }
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
