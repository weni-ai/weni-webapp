<template>
  <div
    v-if="['trial-ended'].includes(type) && canShow"
    :class="['warning-bar', type]"
    :style="{
      display: type ? null : 'none',
    }"
  >
    <UnnnicIcon
      icon="error"
      size="md"
      scheme="fg-inverted"
    />

    <span>{{ warningMessage }}</span>

    <a
      href="#"
      @click.prevent="$emit('openModalTrialPeriod')"
    >
      {{ actionLinkText }}
    </a>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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

    warningMessage() {
      const messageMap = {
        suspended: this.$t('orgs.messages.is_suspended'),
        'trial-ended': `${this.$t('billing.modals.trial_expired.title')}.`,
        'trial-about-to-end': this.$t(
          'billing.modals.trial-about-to-end.warning',
        ),
      };

      return messageMap[this.type] || '';
    },

    actionLinkText() {
      const linkTextMap = {
        suspended: this.$t('orgs.messages.contact_support'),
        'trial-about-to-end': this.$t('billing.invoices.view'),
        'trial-ended': this.$t('billing.modals.common.make_an_upgrade'),
      };

      return linkTextMap[this.type] || '';
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
      },
    },
  },

  methods: {
    ...mapActions(['setBillingStep', 'getOrg', 'setCurrentOrg']),
  },
};
</script>

<style lang="scss" scoped>
.warning-bar {
  background-color: $unnnic-color-bg-red-strong;

  @include unnnic-font-display-3;
  color: $unnnic-color-fg-inverted;

  padding: $unnnic-space-3 0;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-1;

  &.trial-about-to-end {
    background-color: $unnnic-color-feedback-yellow;
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
