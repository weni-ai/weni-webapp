<template>
    <span
      class="weni-emote"
      @mouseenter="onHover()">
        <span v-html="currentEmote" />
    </span>
</template>

<script>
export default {
  name: 'Emote',
  data() {
    return {
      current: 0,
      available: [
        '1F600',
        '1F603',
        '1F604',
        '1F601',
        '1F606',
        '1F605',
        '1F923',
        '1F602',
        '1F642',
        '1F643',
        '1F609',
        '1F60A',
        '1F607',
      ],
    };
  },
  created() {
    this.current = Math.floor(Math.random() * this.available.length)
  },
  computed: {
      currentEmote() {
          return `&#x${this.available[this.current]};`
      },
  },
  methods: {
    onHover() {
      var newCurrent = this.current;
      while (newCurrent === this.current) {
        newCurrent = Math.floor(Math.random() * this.available.length);
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
        font-size: 40px;
        padding: 8px;
        width: 40px;
        height: 40px;
        line-height: 100%;
        border-radius: 50%;
        background-color: white;
        user-select: none;
        box-shadow: $unnic-shadow-level-separated;

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