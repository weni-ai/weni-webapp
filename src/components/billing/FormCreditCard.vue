<template>
  <div class="billing-add-credit-card">
    <unnnic-input
      v-model="$store.state.BillingSteps.billing_details.cpfOrCnpj"
      :label="$t('billing.card.cpf_or_cnpj')"
      :type="cpfOrCnpjError ? 'error' : 'normal'"
      :message="cpfOrCnpjError ? $t(`errors.${cpfOrCnpjError}`) : null"
      @input="$emit('update:errors', { ...errors, cpfOrCnpj: '' })"
    />
    <unnnic-input
      v-model="$store.state.BillingSteps.billing_details.name"
      :label="$t('billing.card.name')"
      :placeholder="$t('billing.card.name_placeholder')"
      :type="nameError ? 'error' : 'normal'"
      :message="nameError ? $t(`errors.${nameError}`) : null"
      @input="$emit('update:errors', { ...errors, name: '' })"
    />
    <div class="billing-add-credit-card__bottom">
      <div>
        <div class="label">
          <label for="card-number">
            {{ $t('billing.card.number') }}
          </label>
        </div>

        <div id="card-number"></div>
      </div>

      <div>
        <div class="label">
          <label for="card-expiry">
            {{ $t('billing.card.due_date') }}
          </label>
        </div>

        <div id="card-expiry"></div>
      </div>

      <div>
        <div class="label">
          <label for="card-cvc">{{ $t('billing.card.ccv') }}</label>
        </div>

        <div id="card-cvc"></div>
      </div>
    </div>
    <div class="billing-add-credit-card__buttons">
      <unnnic-button
        v-if="['create-org', 'change-plan'].includes(flow)"
        type="secondary"
        size="large"
        :text="$t('billing.card.buttons.back')"
        @click="back"
      />
      <unnnic-button
        @click="nextStep"
        size="large"
        :text="$t('billing.card.buttons.next')"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'BillingModal',

  props: {
    flow: String,

    errors: Object,
  },

  data() {
    return {};
  },

  computed: {
    cpfOrCnpjError() {
      return this.errors?.cpfOrCnpj;
    },

    nameError() {
      return this.errors?.name;
    },
  },

  methods: {
    ...mapActions(['openModal']),
    back() {
      this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/plans`);
    },

    nextStep() {
      this.openModal({
        type: 'alert',
        data: {
          // persistent: true,
          icon: 'alert-circle-1',
          scheme: 'feedback-yellow',
          title: this.$t('billing.stripe.verification.title'),
          description: this.$t('billing.stripe.verification.description'),
        },
      });
      this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/address`);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing-add-credit-card {
  .label {
    font-weight: 400;
    line-height: 1.375rem;
    font-size: 0.875rem;
    color: #67738b;
    margin-bottom: 0.5rem;
  }

  > .unnnic-form {
    margin-bottom: $unnnic-spacing-stack-md;
  }

  .unnnic-form {
    p {
      margin-top: 0;
    }
  }
  .weni-report {
    margin-top: $unnnic-spacing-stack-md;
  }

  &__buttons {
    display: flex;
    button {
      width: 100%;
      margin: 0 $unnnic-inline-xs;
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &__bottom {
    display: flex;
    > div:first-child {
      width: 60%;
    }
    > div:nth-child(2) {
      width: 37%;
    }
    > div:last-child {
      width: 18%;
    }

    > div {
      margin: 0 $unnnic-inline-sm $unnnic-spacing-stack-md 0;
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
