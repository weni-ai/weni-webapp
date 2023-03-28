<template>
  <div>
    <div
      class="warning-bar"
      :style="{
        display: isOrganizationPage && show ? null : 'none',
      }"
    >
      <template v-if="type === 'max-active-contacts'">
        <unnnic-icon-svg icon="alert-circle-1-1" size="md" class="icon" />

        {{ $t('orgs.reached_active_contacts_limit', { limit }) }}

        <a href="#" @click.prevent="redirectChangePlanPage">
          {{ $t('orgs.select_a_plan') }}
        </a>
      </template>

      <template v-else-if="type === 'suspended'">
        <unnnic-icon-svg icon="alert-circle-1-1" size="md" class="icon" />

        {{ $t('orgs.messages.is_suspended') }}

        <a href="#" @click.prevent="redirectChangePlanPage">
          {{ $t('orgs.messages.select_a_plan') }}
        </a>

        {{ $t('orgs.messages.or_contact_support') }}
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { get } from 'lodash';

export default {
  props: {
    type: {
      type: String,
      default: 'max-active-contacts',
    },
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

        if (this.type === 'max-active-contacts') {
          const { data } = await this.organizationLimit({ organizationUuid });

          if (!data.limit) {
            return;
          }

          this.limit = data.limit;
          const missingQuantity = get(data, 'missing_quantity', 0);

          if (!missingQuantity) {
            this.show = true;
          }
        } else if (this.type === 'suspended') {
          this.show = this.currentOrg.is_suspended;
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

    redirectChangePlanPage() {
      this.$store.state.BillingSteps.flow = 'change-plan';
      this.$router.push(`/orgs/${this.currentOrgUuid}/billing/plans`);
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
