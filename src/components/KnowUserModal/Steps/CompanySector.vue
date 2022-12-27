<template>
  <div class="account-company-sector">
    <select-tag
      :value="sector"
      @input="$emit('update:sector', $event)"
      :options="services"
    ></select-tag>
  </div>
</template>

<script>
import { AccountInitOptions } from '../AccountInitOptions';
import SelectTag from './SelectTag.vue';

export default {
  props: {
    sector: Object,
  },

  components: {
    SelectTag,
  },

  data() {
    return {
      services: [],
    };
  },
  computed: {},
  created() {
    this.services = AccountInitOptions;
  },
};
</script>

<style scoped lang="scss">
.account-company-sector {
  display: flex;
  flex-direction: column;
}
</style>
