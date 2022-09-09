<template>
  <div class="account-company-sector">
    <select-tag
      :value="subSector"
      @input="$emit('update:sub-sector', $event)"
      :options="sector.options"
    ></select-tag>
  </div>
</template>

<script>
import { AccountInitOptions } from '../AccountInitOptions';
import SelectTag from './SelectTag.vue';

export default {
  components: {
    SelectTag,
  },

  props: {
    sector: {
      type: Object,
    },

    subSector: {
      type: Object,
    },
  },

  data() {
    return {};
  },
  computed: {},
  created() {},
  methods: {},
};
</script>

<style scoped lang="scss">
.account-company-sector {
  display: flex;
  flex-direction: column;
}
</style>
