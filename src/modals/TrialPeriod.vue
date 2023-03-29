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
              orgUuid,
            },
          }"
          v-slot="{ href, navigate }"
        >
          <a
            :href="href"
            @click="click($event, navigate)"
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
              orgUuid,
            },
          }"
          v-slot="{ href, navigate }"
        >
          <a
            :href="href"
            @click="click($event, navigate)"
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
      alreadyShowed: {},
      orgExpired: null,
      orgExpiring: null,
    };
  },

  computed: {
    orgUuid() {
      return this.$store.getters.org?.uuid;
    },
  },

  watch: {
    orgUuid: {
      immediate: true,
      handler() {
        this.orgExpired = null;
        this.orgExpiring = null;

        if (!this.orgUuid) {
          return;
        }

        if (this.alreadyShowed[this.orgUuid]) {
          return;
        }

        this.orgExpired =
          this.$store.getters.org.organization_billing.days_till_trial_end < 0;

        if (!this.orgExpired) {
          const days =
            this.$store.getters.org.organization_billing.days_till_trial_end;

          this.orgExpiring = days >= 0 && days <= 3;
        }

        if (this.orgExpired || this.orgExpiring) {
          this.$set(this.alreadyShowed, this.orgUuid, true);
        }
      },
    },
  },

  methods: {
    click($event, navigate) {
      this.$store.state.BillingSteps.flow = 'change-plan';
      navigate($event);
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
