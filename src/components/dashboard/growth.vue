<template>
    <div class="weni-growth">
        <unnic-card type="dash" title="Mensagens Enviadas" :value="10000" scheme="aux-blue" />
        <unnic-card type="dash" title="Fluxos criados" icon="hierarchy-3-2" :value="10000" scheme="aux-pink" />
        <unnic-card type="dash" title="Idiomas Adiconados" icon="chat-translate-1" :value="10000" scheme="aux-purple" />
        <unnic-card type="dash" title="Pessoas alcançadas" icon="chat-translate-1" :value="10000" scheme="aux-lemon" />
    </div>
</template>

<script>
import dashboard from '../../api/dashboard.js';
import unnic from 'unnic-system-beta';
export default {
    name: 'Growth',
    components: { UnnicCard: unnic.UnnicCard },
    data() {
      return {
        status: {
            ia: null,
            flow: null,
            omnichannel: null,
        },
      };
    },
    mounted() {
      // this.getStatus();
    },
    methods: {
      async getStatus() {
          const response = await dashboard.status();
          const list = response.data.results;
      }
    }
}
</script>

<style lang="scss">
  @import '~unnic-system-beta/src/assets/scss/unnic.scss';
  .weni-growth {
    > * {
        background-color: $unnic-color-neutral-snow !important;
    }

    > :not(:last-child) {
      margin-bottom: $unnic-spacing-stack-sm;
    }
  }
</style>