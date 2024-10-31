<template>
  <div class="account-company-sector">
    <SelectTag
      :modelValue="subSector"
      :options="sector.options"
      @update:model-value="$emit('update:sub-sector', $event)"
    ></SelectTag>
  </div>
</template>

<script>
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
