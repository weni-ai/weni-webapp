<template>
  <div
    :style="{
      display: 'grid',
      alignItems: 'center',
      columnGap: '24px',
      gridTemplateColumns: '[left] 40px [content] 1fr [right] 40px',
    }"
  >
    <UnnnicIcon
      v-if="!isCardTrialVisible"
      size="xl"
      icon="arrow_back_ios"
      scheme="neutral-darkest"
      clickable
      @click="goToCard('trial')"
    />

    <div
      :style="{
        overflowX: 'hidden',
        display: 'grid',
        columnGap: '16px',
        scrollSnapType: 'x mandatory',
        gridTemplateColumns: 'repeat(5, calc((100% - 16px) / 2))',
        gridTemplateColumns: 'repeat(5, calc((100% - 32px) / 3))',
        gridColumn: 'content',
        scrollBehavior: 'smooth',
      }"
    >
      <BillingCard
        v-for="type in plans"
        :key="type"
        :ref="`card-${type}`"
        :style="{ scrollSnapAlign: 'start' }"
        :type="type"
        :recommended="
          canChoose.includes('start') ? type === 'start' : type === canChoose[0]
        "
        :buttonDisabled="isSettingUpIntent"
        :flow="flow"
        :disabled="!canChoose.includes(type)"
        :expanded="expanded"
        :showSameAsScaleText="plans.includes('scale')"
        @select="$emit('on-choose-plan', type)"
        @update:expanded="$emit('update:expanded', $event)"
      />
    </div>

    <UnnnicIcon
      v-if="!isCardEnterpriseVisible"
      size="xl"
      icon="arrow_forward_ios"
      scheme="neutral-darkest"
      clickable
      @click="goToCard('enterprise')"
    />
  </div>
</template>

<script>
import BillingCard from '@/components/billing/Card.vue';

export default {
  components: {
    BillingCard,
  },

  props: {
    flow: String,
    isSettingUpIntent: Boolean,
    expanded: Boolean,
  },

  data() {
    return {
      isCardTrialVisible: false,
      isCardEnterpriseVisible: false,
    };
  },

  computed: {
    plans() {
      return ['trial', 'advanced', 'enterprise'];
    },

    canChoose() {
      const allPlans = ['trial', 'start', 'scale', 'advanced', 'enterprise'];

      if (this.flow === 'change-plan') {
        return allPlans.slice(
          allPlans.indexOf(
            this.$store.getters.currentOrg?.organization_billing?.plan,
          ) + 1,
        );
      }

      return allPlans;
    },
  },

  async mounted() {
    this.registerView('trial', 'isCardTrialVisible');
    this.registerView('enterprise', 'isCardEnterpriseVisible');
  },

  methods: {
    goToCard(plan) {
      this.$refs[`card-${plan}`][0].$el.scrollIntoView();
    },

    registerView(plan, variable) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        let isIntersecting = false;

        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
        });

        this[variable] = isIntersecting;
      });

      this.intersectionObserver.observe(this.$refs[`card-${plan}`][0].$el);
    },
  },
};
</script>
