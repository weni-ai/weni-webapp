<template>
    <div class="weni-status">
        <unnic-card type="status" title="Inteligência Artificial" status="Operacional" description="Última ocorrência" />
        <unnic-card type="status" title="Fluxos" status="Com dificuldade" icon="hierarchy-3-2" description="Última ocorrência" />
        <unnic-card type="status" title="Omnichannel" status="Fora do ar" icon="messaging-we-chat-3" description="Última ocorrência" />
    </div>
</template>

<script>
import dashboard from '../../api/dashboard.js';
import unnic from 'unnic-system-beta';
export default {
    name: 'Status',
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
      this.getStatus();
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
  .weni-status {
    > * {
      background-color: $unnic-color-neutral-lightest !important;
    }
    :not(:last-child) {
      margin-bottom: $unnic-spacing-stack-sm;
    }
  }
</style>