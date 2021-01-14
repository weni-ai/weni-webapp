<template>
    <div class="weni-growth">
        <unnic-card 
          v-for="item in growth"
          :key="item.key"
          :title="$t(item.key)"
          :icon="item.icon"
          :value="item.value"
          :percent="getPercentage(item.value, item.oldValue)"
          :scheme="item.scheme"
          type="dash" />
    </div>
</template>

<script>
import unnic from 'unnic-system-beta';
export default {
  name: 'Growth',
  components: { UnnicCard: unnic.UnnicCard },
  data() {
    return {
      growth: [
        { key: "home.growth.messages", value: 75167071, oldValue: 219803, icon: "messages-bubble-1", scheme: "aux-blue" },
        { key: "home.growth.flows", value: 16587, oldValue: 1726, icon: "hierarchy-3-2", scheme: "aux-pink" },
        { key: "home.growth.languages", value: 75167071, oldValue: 219803, icon: "chat-translate-1", scheme: "aux-purple" },
        { key: "home.growth.contacts", value: 5461975, oldValue: 11791, icon: "chat-translate-1", scheme: "aux-lemon" }
      ],
    };
  },
  methods: {
    getPercentage(newValue, oldValue) {
      if (oldValue === 0) return null;
      return Math.floor(((newValue - oldValue)/oldValue)*100);
    }
  }
}
</script>

<style lang="scss">
  @import '~unnic-system-beta/src/assets/scss/unnic.scss';
  .weni-growth {
    > * {
        background-color: $unnic-color-neutral-snow !important;
    }

    > :not(:last-child) {
      margin-bottom: $unnic-spacing-stack-sm;
    }
  }
</style>