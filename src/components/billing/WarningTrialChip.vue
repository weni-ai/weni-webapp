<template>
  <RouterLink
    v-if="canShow"
    :to="{
      name: 'BillingPlans',
      params: {
        orgUuid: $store.getters.org.uuid,
      },
    }"
    v-slot="{ href, navigate }"
  >
    <a
      :class="[
        'warning-trial-chip',
        {
          'warning-trial-chip--scheme-red': type === 'expired',
        },
      ]"
      :href="href"
      @click="
        ($event) => {
          $store.state.BillingSteps.flow = 'change-plan';
          navigate($event);
        }
      "
    >
      <template v-if="type === 'expiring'">
        {{ $t('billing.modals.trial_expiring.short.title') }}
        <strong>
          {{
            $tc('billing.modals.trial_expiring.short.days', daysTillTrialEnds, {
              days: daysTillTrialEnds,
            })
          }}
        </strong>
      </template>

      <template v-else-if="type === 'expired'">
        {{ $t('billing.modals.trial_expired.short.title') }}
        {{ $t('billing.modals.common.make_an_upgrade') }}.
      </template>
    </a>
  </RouterLink>
</template>

<script>
import { ORG_ROLE_ADMIN, ORG_ROLE_FINANCIAL } from '../orgs/orgListItem.vue';

export default {
  data() {
    return {};
  },

  computed: {
    canShow() {
      if (!this.type) {
        return false;
      }

      if (!(this.$route.params.orgUuid || this.$route.params.projectUuid)) {
        return false;
      }

      if (this.$route.name === 'projects' && this.type === 'expired') {
        return false;
      }

      if (this.$route.name === 'BillingPlans') {
        return false;
      }

      if (
        ![ORG_ROLE_ADMIN, ORG_ROLE_FINANCIAL].includes(
          this.$store.getters.org.authorization.role,
        )
      ) {
        return false;
      }

      return true;
    },

    type() {
      const plan = this.$store.getters.org?.organization_billing.plan;

      if (plan !== 'trial') {
        return '';
      }

      return this.daysTillTrialEnds > 0 ? 'expiring' : 'expired';
    },

    daysTillTrialEnds() {
      return this.$store.getters.org?.organization_billing.days_till_trial_end;
    },
  },
};
</script>

<style lang="scss" scoped>


.warning-trial-chip {
  text-decoration: none;
  white-space: nowrap;

  margin-right: $unnnic-spacing-sm;
  padding: $unnnic-spacing-xs;

  border-radius: $unnnic-border-radius-pill;

  outline-style: solid;
  outline-color: $unnnic-color-weni-700;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  background-color: $unnnic-color-weni-50;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  color: $unnnic-color-weni-600;
  font-weight: $unnnic-font-weight-regular;

  user-select: none;

  strong {
    font-weight: $unnnic-font-weight-bold;
  }

  &--scheme-red {
    outline-color: $unnnic-color-aux-red-500;
    background-color: $unnnic-color-aux-red-100;
    color: $unnnic-color-aux-red-500;
    font-weight: $unnnic-font-weight-bold;
  }
}
</style>
