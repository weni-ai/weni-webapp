<template>
    <span
      class="weni-emote"
      @mouseenter="onHover()">
        <img :src="currentEmote" />
    </span>
</template>

<script>
export default {
  name: 'Emote',
  data() {
    return {
      current: 0,
      total: 45,
    };
  },
  mounted() {
    const lastEmote = localStorage.getItem('lastEmote');
    if (lastEmote) this.current = parseInt(lastEmote);
    else this.current = Math.floor(Math.random() * this.total);
  },
  computed: {
    currentEmote() {
      return require(`../assets/emoji/u1F${600 + this.current}.png`);
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
    }
  }
}
</script>

<style lang="scss">
@import '~unnic-system-beta/src/assets/scss/unnic.scss';
    .weni-emote {
        display: inline-block;
        padding: 8px;
        width: $unnic-avatar-size-sm;
        height: $unnic-avatar-size-sm;
        border-radius: 50%;
        background-color: $unnic-color-background-snow;
        user-select: none;
        box-shadow: $unnic-shadow-level-separated;

        img {
          min-width: $unnic-avatar-size-sm;
          min-height: $unnic-avatar-size-sm;
          max-width: $unnic-avatar-size-sm;
          max-height: $unnic-avatar-size-sm;
        }

        &:hover{
            animation: pop 0.3s linear 1;
        }
    }

    @keyframes pop{
        0% {transform: rotate(5deg);}
        50%  {transform: scale(1.3);};
        75% {transform: rotate(-5deg);}
    }
</style>