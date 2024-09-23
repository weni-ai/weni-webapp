<template>
  <div>
    <UnnnicModalNext
      v-if="orgExpired"
      type="alert"
      :title="$t('billing.modals.trial_expired.title')"
      showCloseButton
      icon="alert-circle-1"
      scheme="feedback-red"
      @close="orgExpired = null"
    >
      <template #description>
        {{ $t('billing.modals.trial_expired.description') }}

        <RouterLink
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
        </RouterLink>
      </template>
    </UnnnicModalNext>

    <UnnnicModalNext
      v-else-if="orgExpiring"
      type="alert"
      :title="$t('billing.modals.trial_expiring.title')"
      showCloseButton
      icon="alert-circle-1"
      scheme="feedback-yellow"
      @close="orgExpiring = null"
    >
      <template #description>
        {{
          $t('billing.modals.trial_expiring.description', {
            days: $store.getters.org.organization_billing.days_till_trial_end,
          })
        }}

        <RouterLink
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
        </RouterLink>
      </template>
    </UnnnicModalNext>
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

        if (
          !['free', 'trial', 'start', 'scale', 'advanced'].includes(
            this.$store.getters.org?.organization_billing?.plan,
          )
        ) {
          return;
        }

        if (this.alreadyShowed[this.orgUuid]) {
          return;
        }

        if (
          this.$store.getters.org.organization_billing.days_till_trial_end ===
          null
        ) {
          return;
        }

        this.orgExpired =
          this.$store.getters.org.organization_billing.plan === 'trial' &&
          this.$store.getters.org.organization_billing.days_till_trial_end < 0;

        if (!this.orgExpired) {
          const days =
            this.$store.getters.org.organization_billing.plan === 'trial' &&
            this.$store.getters.org.organization_billing.days_till_trial_end;

          this.orgExpiring = days >= 0 && days <= 3;
        }

        if (this.orgExpired || this.orgExpiring) {
          this.alreadyShowed[this.orgUuid] = true;
        }
      },
    },
  },

  methods: {
    click($event, navigate) {
      this.$store.state.BillingSteps.flow = 'change-plan';
      navigate($event);

      this.orgExpired = null;
      this.orgExpiring = null;
    },
  },
};
</script>

<style lang="scss" scoped>
a {
  text-underline-offset: $unnnic-spacing-stack-nano;
}
</style>
