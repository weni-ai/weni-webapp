<template>
  <div>
    <unnnic-modal-next
      v-if="orgExpired"
      type="alert"
      :title="$t('billing.modals.trial_expired.title')"
      show-close-button
      icon="alert-circle-1"
      scheme="feedback-red"
      @close="orgExpired = null"
    >
      <template slot="description">
        {{ $t('billing.modals.trial_expired.description') }}

        <router-link
          :to="{
            name: 'BillingPlans',
            params: {
              orgUuid: orgExpired.uuid,
            },
          }"
          @click.native="$store.state.BillingSteps.flow = 'change-plan'"
          v-slot="{ href, navigate }"
        >
          <a
            :href="href"
            @click="click($event, navigate, orgExpired, 'orgExpired')"
            class="u color-neutral-cloudy"
          >
            {{ $t('billing.modals.common.make_an_upgrade') }}
          </a>
        </router-link>
      </template>
    </unnnic-modal-next>

    <unnnic-modal-next
      v-else-if="orgExpiring"
      type="alert"
      :title="$t('billing.modals.trial_expiring.title')"
      show-close-button
      icon="alert-circle-1"
      scheme="feedback-yellow"
      @close="orgExpiring = null"
    >
      <template slot="description">
        {{
          $t('billing.modals.trial_expiring.description', {
            days: orgExpiring.organization_billing.days_till_trial_end,
          })
        }}

        <router-link
          :to="{
            name: 'BillingPlans',
            params: {
              orgUuid: orgExpiring.uuid,
            },
          }"
          @click.native="$store.state.BillingSteps.flow = 'change-plan'"
          v-slot="{ href, navigate }"
        >
          <a
            :href="href"
            @click="click($event, navigate, orgExpiring, 'orgExpiring')"
            class="u color-neutral-cloudy"
          >
            {{ $t('billing.modals.common.make_an_upgrade') }}
          </a>
        </router-link>
      </template>
    </unnnic-modal-next>
  </div>
</template>

<script>
export default {
  data() {
    return {
      alreadyShowed: false,
      orgExpired: null,
      orgExpiring: null,
    };
  },

  computed: {
    isOrgsPage() {
      return [
        this.$route.name === 'orgs',
        this.$store.state.Org.orgs.data.length,
      ].join(':');
    },
  },

  watch: {
    isOrgsPage: {
      immediate: true,

      handler() {
        if (this.$route.name !== 'orgs' || this.alreadyShowed) {
          return;
        }

        this.orgExpired = this.$store.state.Org.orgs.data.find(
          ({ organization_billing: { days_till_trial_end: days } }) => days < 0,
        );

        if (!this.orgExpired) {
          this.orgExpiring = this.$store.state.Org.orgs.data.find(
            ({ organization_billing: { days_till_trial_end: days } }) =>
              days >= 0 && days <= 3,
          );
        }

        if (this.orgExpired || this.orgExpiring) {
          this.alreadyShowed = true;
        }
      },
    },
  },

  methods: {
    click($event, navigate, org, name) {
      this.$store.state.BillingSteps.flow = 'change-plan';
      this.$store.dispatch('setCurrentOrg', org);
      navigate($event);
      this.$set(this, name, null);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

a {
  text-underline-offset: $unnnic-spacing-stack-nano;
}
</style>
