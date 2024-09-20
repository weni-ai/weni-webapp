<template>
  <div class="account-company-sector">
    <SelectTag
      :modelValue="sector"
      @update:model-value="$emit('update:sector', $event)"
      :options="services"
    ></SelectTag>
  </div>
</template>

<script>
import AccountInitOptions from '../AccountInitOptions';
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
