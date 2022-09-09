<template>
  <div class="account-company-sector">
    {{ sector }}
    <select-tag v-model="selectedItem" :options="sector.options"></select-tag>

    {{ selectedItem }}

    <unnnic-input />
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
  },

  data() {
    return {
      isInputVisible: false,
      services: [],
      selectedItem: null,
    };
  },
  computed: {},
  created() {
    this.services = AccountInitOptions;
  },
  methods: {
    selectSector(selectedService) {
      this.selectedItem = selectedService;
      this.services = this.services.map((service) => {
        return {
          ...service,
          disabled: service !== selectedService,
        };
      });
    },
  },
};
</script>

<style scoped lang="scss">
.account-company-sector {
  display: flex;
  flex-direction: column;
}
</style>
