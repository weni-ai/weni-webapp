<template>
  <div class="weni-growth">
    <unnnic-card
      v-for="item in growth"
      :key="item.key"
      :title="$t(item.key)"
      :icon="item.icon"
      :value="item.value"
      :percent="getPercentage(item.value, item.oldValue)"
      :scheme="item.scheme"
      type="dash"
    />
  </div>
</template>

<script>
export default {
  name: 'Growth',
  data() {
    return {
      growth: [
        {
          key: 'home.growth.messages',
          value: 75167071,
          oldValue: 219803,
          icon: 'messages-bubble-1',
          scheme: 'aux-blue',
        },
        {
          key: 'home.growth.flows',
          value: 16587,
          oldValue: 1726,
          icon: 'account_tree',
          scheme: 'aux-pink',
        },
        {
          key: 'home.growth.languages',
          value: 184,
          oldValue: 184,
          icon: 'chat-translate-1',
          scheme: 'aux-purple',
        },
        {
          key: 'home.growth.contacts',
          value: 5461975,
          oldValue: 11791,
          icon: 'chat-translate-1',
          scheme: 'aux-lemon',
        },
      ],
    };
  },
  methods: {
    getPercentage(newValue, oldValue) {
      if (oldValue === 0) return null;
      return Math.floor(((newValue - oldValue) / oldValue) * 100);
    },
  },
};
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.weni-growth {
  > * {
    background-color: $unnnic-color-neutral-snow !important;
  }

  > :not(:last-child) {
    margin-bottom: $unnnic-spacing-stack-sm;
  }
}
</style>
