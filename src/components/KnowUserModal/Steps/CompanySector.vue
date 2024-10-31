<template>
  <div class="account-company-sector">
    <SelectTag
      :modelValue="sector"
      :options="services"
      @update:model-value="$emit('update:sector', $event)"
    ></SelectTag>
  </div>
</template>

<script>
import AccountInitOptions from '../AccountInitOptions';
import SelectTag from './SelectTag.vue';

export default {
  components: {
    SelectTag,
  },
  props: {
    sector: Object,
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
