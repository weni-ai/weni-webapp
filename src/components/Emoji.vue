<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <img
    :src="currentEmote"
    :title="name"
  />
</template>

<script>
import WinkingFace from '@/assets/emoji/u1F609.png';
import SmilingFacewithSmilingEyes from '@/assets/emoji/u1F645.png';

export default {
  props: {
    name: {
      type: String,
    },
  },

  computed: {
    currentEmote() {
      const codes = {
        'Winking Face': WinkingFace,
        'Smiling Face with Smiling Eyes': SmilingFacewithSmilingEyes,
      };

      const imagePath = codes[this.name] || '';

      return imagePath;
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  height: 1em;
  user-select: none;
  margin-bottom: -0.05em;
}
</style>
