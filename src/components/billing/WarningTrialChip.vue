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
      <UnnnicIcon
        icon="error"
        size="sm"
        class="warning-trial-chip__icon"
        scheme="inherit"
      />

      <template v-if="type === 'expiring'">
        {{ $t('billing.modals.trial_expiring.short.title') }}

        {{
          $t('billing.modals.trial_expiring.short.days', {
            days: daysTillTrialEnds,
          }, daysTillTrialEnds)
        }}
      </template>

      <template v-else-if="type === 'expired'">
        {{ $t('billing.modals.trial_expired.short.title') }}
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
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;
  text-decoration: none;
  white-space: nowrap;

  padding: $unnnic-spacing-xs;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  color: $unnnic-color-weni-600;
  font-weight: $unnnic-font-weight-bold;

  &:hover {
    color: $unnnic-color-weni-700;
  }

  &--scheme-red {
    color: $unnnic-color-aux-red-500;

    &:hover {
      color: $unnnic-color-aux-red-700;
    }
  }
}
</style>
