<template>
  <div
    v-if="['trial-ended'].includes(type) && canShow"
    :class="['warning-bar', type]"
    :style="{
      display: type ? null : 'none',
    }"
  >
    <template v-if="type === 'max-active-contacts'">
      <UnnnicIconSvg
        icon="alert-circle-1-1"
        size="md"
        class="icon"
      />

      {{ $t('orgs.reached_active_contacts_limit', { limit }) }}

      <a
        href="#"
        @click.prevent="$emit('openModalTrialPeriod')"
      >
        {{ $t('orgs.select_a_plan') }}
      </a>
    </template>

    <template v-else-if="type === 'suspended'">
      <UnnnicIconSvg
        icon="alert-circle-1-1"
        size="md"
        class="icon"
      />

      {{ $t('orgs.messages.is_suspended') }}

      <a
        href="#"
        @click.prevent="$emit('openModalTrialPeriod')"
      >
        {{ $t('orgs.messages.contact_support') }}
      </a>
    </template>

    <template v-else-if="['trial-about-to-end', 'trial-ended'].includes(type)">
      <UnnnicIconSvg
        icon="alert-circle-1-1"
        size="md"
        class="icon"
      />

      <template v-if="type === 'trial-ended'">
        {{ $t('billing.modals.trial_expired.title') }}.
      </template>

      <template v-else-if="type === 'trial-about-to-end'">
        {{ $t('billing.modals.trial-about-to-end.warning') }}
      </template>

      <a
        href="#"
        @click.prevent="$emit('openModalTrialPeriod')"
      >
        {{
          type === 'trial-about-to-end'
            ? $t('billing.invoices.view')
            : $t('billing.modals.common.make_an_upgrade')
        }}
      </a>
    </template>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { get } from 'lodash';

export default {
  props: {},
  emits: ['openModalTrialPeriod'],

  data() {
    return {
      limit: 0,
      isChangePlanOpen: false,

      type: '',
    };
  },

  computed: {
    ...mapState({
      currentOrg: (state) => state.Org.currentOrg,
    }),
    orgUuid() {
      if (this.$store.state.News.status !== 'loaded') {
        return;
      }

      return this.$store.getters.org?.uuid;
    },

    canShow() {
      return this.$route.name === 'projects';
    },
  },

  watch: {
    orgUuid: {
      immediate: true,
      async handler(organizationUuid) {
        this.type = '';

        if (!organizationUuid) {
          return;
        }

        if (
          this.$store.getters.org.organization_billing.plan === 'trial' &&
          this.$store.getters.org.organization_billing.days_till_trial_end < 0
        ) {
          this.type = 'trial-ended';
          return;
        }

        if (this.$store.getters.org.is_suspended) {
          this.type = 'suspended';
          return;
        }

        try {
          const { data } = await this.organizationLimit({ organizationUuid });

          // update org billing active contact data
          await this.setCurrentOrg({
            ...this.currentOrg,
            organization_billing: {
              ...this.currentOrg.organization_billing,
              currenty_invoice: {
                amount_currenty:
                  this.currentOrg.organization_billing.currenty_invoice
                    .amount_currenty,
                total_contact: data.current_active_contacts,
              },
            },
          });

          if (!data.limit) {
            return;
          }

          this.limit = data.limit;
          const missingQuantity = get(data, 'missing_quantity', 0);

          if (!missingQuantity) {
            this.type = 'max-active-contacts';
            return;
          }
        } catch (error) {
          console.log(error);
        }
      },
    },
  },

  methods: {
    ...mapActions([
      'organizationLimit',
      'setBillingStep',
      'getOrg',
      'setCurrentOrg',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.warning-bar {
  background-color: $unnnic-color-feedback-red;
  color: $unnnic-color-background-sky;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-lg;
  line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  text-align: center;
  padding: 0.75rem 0;

  &.trial-about-to-end {
    background-color: $unnnic-color-feedback-yellow;
  }

  .icon {
    margin-right: $unnnic-spacing-inline-xs;

    :deep(.primary) {
      fill: $unnnic-color-background-sky;
    }
  }

  a {
    color: inherit;
    text-underline-offset: $unnnic-spacing-stack-nano;
    display: inline-block;

    &:first-letter {
      text-transform: capitalize;
    }
  }
}
</style>
