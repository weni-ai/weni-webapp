<template>
  <span
    class="weni-emote"
    @mouseenter="onHover()"
  >
    <img :src="currentEmote" />
  </span>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Emote',
  data() {
    return {
      current: 0,
      total: 45,
    };
  },
  mounted() {
    const SMILE = 3;
    const lastEmote = localStorage.getItem('lastEmote');
    if (lastEmote) this.current = parseInt(lastEmote);
    else this.current = SMILE;
  },
  computed: {
    currentEmote() {
      return import(`../assets/emoji/u1F${600 + this.current}.png`);
    },
  },
  watch: {
    current() {
      localStorage.setItem('lastEmote', `${this.current}`);
    },
  },
  methods: {
    onHover() {
      var newCurrent = this.current;
      while (newCurrent === this.current) {
        newCurrent = Math.floor(Math.random() * this.total);
      }
      this.current = newCurrent;
    },
  },
};
</script>

<style lang="scss">
.weni-emote {
  display: inline-block;
  padding: 8px;
  width: $unnnic-avatar-size-sm;
  height: $unnnic-avatar-size-sm;
  border-radius: 50%;
  background-color: $unnnic-color-background-snow;
  user-select: none;
  box-shadow: $unnnic-shadow-level-separated;

  img {
    min-width: $unnnic-avatar-size-sm;
    min-height: $unnnic-avatar-size-sm;
    max-width: $unnnic-avatar-size-sm;
    max-height: $unnnic-avatar-size-sm;
  }

  &:hover {
    animation: pop 0.3s linear 1;
  }
}

@keyframes pop {
  0% {
    transform: rotate(5deg);
  }
  50% {
    transform: scale(1.3);
  }
  75% {
    transform: rotate(-5deg);
  }
}
</style>
