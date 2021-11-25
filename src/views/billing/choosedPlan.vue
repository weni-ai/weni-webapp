<template>
  <billing-modal>
    <slot slot="content">
      <div class="billing-choosed-plan unnnic-grid-span-12">
        <img
          class="billing-choosed-plan__image"
          src="../../assets/choosedPlan.svg"
          alt="Plano escolhido"
        />

        <h1 class="billing-choosed-plan__title">
          Plano escolhido com sucesso!
        </h1>
        <p class="billing-choosed-plan__subtitle">
          Agora você possui acesso ilimitado à nossa plataforma. Desenvolva
          Fluxos, crie Chatbots inteligentes e torne o seu atendimento mais
          humano com a Weni Plataforma
          <emoji name="Smiling Face with Smiling Eyes" />
        </p>

        <unnnic-button
          @click="
            $router.push({
              name: 'projects',
              params: { orgUuid: currentOrg.uuid },
            })
          "
        >
          <unnnic-icon-svg
            icon="keyboard-arrow-right-1"
            size="md"
            scheme="neutral-snow"
          />
        </unnnic-button>
      </div>
    </slot>
  </billing-modal>
</template>

<script>
import BillingModal from '@/components/billing/Modal.vue';
import Emoji from '@/components/Emoji.vue';
import { mapGetters } from 'vuex';

export default {
  props: {
    type: {
      type: String,
      default: 'plan',
      validator: (val) => ['plan', 'enterprise', 'custom'].includes(val),
    },
  },

  computed: {
    ...mapGetters(['currentOrg']),
  },

  components: {
    BillingModal,
    Emoji,
  },
};
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.billing-choosed-plan {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 682px;
  margin: 0 auto;

  &__title {
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-regular;
    color: $unnnic-color-neutral-darkest;
    margin-top: $unnnic-spacing-stack-lg;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  &__subtitle {
    color: $unnnic-color-neutral-cloudy;
    text-align: center;
    max-width: 682px;
    margin-bottom: $unnnic-spacing-stack-lg;
  }
}
.close-button {
  display: none;
}
</style>
