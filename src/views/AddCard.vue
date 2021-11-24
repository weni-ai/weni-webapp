<template>
  <div class="container">
    Aqui
    <!-- <label>Card Number</label>
    <div id="card-number"></div>
    <label>Card Expiry</label>
    <div id="card-expiry"></div>
    <label>Card CVC</label>
    <div id="card-cvc"></div>
    <div id="card-error"></div>
    <button ref="buttonTop" id="custom-button" @click="createOther">
      Generate Token
    </button> -->
    BillingCreateOrg
    <billing-create-org />
  </div>
</template>

<script>
import BillingCreateOrg from '@/views/billing/createOrg.vue';
import { mapActions } from 'vuex';

export default {
  components: {
    BillingCreateOrg,
  },
  data() {
    return {
      // organizationUuid: '06a108a4-6f2f-4aa0-b9a8-d941234e8862', // temp
      organizationUuid: '88d624bb-cde4-4daf-bcd9-4974ca67fea3', // temp
      clientSecret: null,
      token: null,
      cardNumber: null,
      cardExpiry: null,
      cardCvc: null,
    };
  },

  computed: {
    stripeElements() {
      return this.$stripe.elements();
    },
  },

  methods: {
    ...mapActions(['setupIntent']),

    async createToken() {
      const { token, error } = await this.$stripe.createToken(this.cardNumber);
      if (error) {
        console.log('error', error, error.message);
        return;
      }
      console.log('token generated', token);
    },

    async createOther() {
      this.$refs.buttonTop.disabled = true;

      const response = await this.$stripe.confirmCardSetup(this.clientSecret, {
        payment_method: {
          card: this.cardNumber,
        },
      });

      if (response.error) {
        console.log('error', response.error);
      } else {
        console.log('response', response);
      }
    },
  },

  mounted() {
    /* console.log('stripe', this.$stripe);
    this.setupIntent({ organizationUuid: this.organizationUuid }).then(
      (response) => {
        this.clientSecret = response?.data?.client_secret;
        console.log('response intent', this.clientSecret);
      },
    );

    const style = {
      base: {
        color: 'black',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '14px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };
    this.cardNumber = this.stripeElements.create('cardNumber', { style });
    this.cardNumber.mount('#card-number');
    this.cardExpiry = this.stripeElements.create('cardExpiry', { style });
    this.cardExpiry.mount('#card-expiry');
    this.cardCvc = this.stripeElements.create('cardCvc', { style });
    this.cardCvc.mount('#card-cvc');
    */
  },

  beforeDestroy() {
    this.cardNumber.destroy();
    this.cardExpiry.destroy();
    this.cardCvc.destroy();
  },
};
</script>

<style lang="scss" scoped>
.container {
  width: 1040px;
  margin: 0 auto;
}
</style>
