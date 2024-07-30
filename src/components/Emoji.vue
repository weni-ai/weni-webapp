<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <img
    :src="currentEmote"
    :title="name"
  />
</template>

<script>
export default {
  props: {
    name: {
      type: String,
    },
  },

  computed: {
    currentEmote() {
      const codes = {
        'Winking Face': 'u1F609',
        'Smiling Face with Smiling Eyes': 'u1F645',
      };

      const basePath = '../assets/emoji/';
      const imagePath = codes[this.name] ? `${basePath}${codes[this.name]}.png` : '';

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
