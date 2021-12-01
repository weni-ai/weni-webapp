<template>
  <div>
    <div
      class="warning-bar"
      :style="{
        display: isOrganizationPage && show ? null : 'none',
      }"
    >
      <unnnic-icon-svg icon="alert-circle-1-1" size="md" class="icon" />

      {{ $t('orgs.reached_active_contacts_limit', { limit }) }}

      <a href="#" @click.prevent="openChangePlanModal">
        {{ $t('orgs.select_a_plan') }}
      </a>
    </div>

    <billing-create-org
      v-if="isChangePlanOpen"
      flow="change-plan"
      show-close
      @close="isChangePlanOpen = false"
      @credit-card-changed="reloadCurrentOrg"
      @organization-changed="reloadCurrentOrg(0)"
    />
  </div>
</template>

<script>
import BillingCreateOrg from '@/views/billing/createOrg.vue';
import { mapActions, mapGetters } from 'vuex';
import { get } from 'lodash';

export default {
  components: {
    BillingCreateOrg,
  },

  data() {
    return {
      show: false,
      limit: 0,
      isChangePlanOpen: false,
    };
  },

  computed: {
    ...mapGetters(['currentOrg']),

    currentOrgUuid() {
      return this.currentOrg?.uuid;
    },

    isOrganizationPage() {
      return (
        this.$route.params.orgUuid || this.$route.params.projectUuid || false
      );
    },
  },

  watch: {
    currentOrgUuid: {
      immediate: true,
      async handler(organizationUuid) {
        this.show = false;

        if (!organizationUuid) {
          return;
        }

        const { data } = await this.organizationLimit({ organizationUuid });

        if (!data.limit) {
          return;
        }

        this.limit = data.limit;
        const missingQuantity = get(data, 'missing_quantity', 0);

        if (!missingQuantity) {
          this.show = true;
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

    openChangePlanModal() {
      this.isChangePlanOpen = true;
      this.setBillingStep('plans');
    },

    sleep(seconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1e3);
      });
    },

    async reloadCurrentOrg(secondsDelay = 3) {
      this.show = false;

      await this.sleep(secondsDelay);

      try {
        const { data: org } = await this.getOrg({
          uuid: this.$route.params.orgUuid,
        });

        this.setCurrentOrg(org);
      } catch (error) {
        console.log('error', error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.warning-bar {
  background-color: $unnnic-color-feedback-red;
  color: $unnnic-color-background-sky;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-lg;
  line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  text-align: center;
  padding: 0.75rem 0;

  .icon {
    margin-right: $unnnic-spacing-inline-xs;

    ::v-deep .primary {
      fill: $unnnic-color-background-sky;
    }
  }

  a {
    color: inherit;
  }
}
</style>
