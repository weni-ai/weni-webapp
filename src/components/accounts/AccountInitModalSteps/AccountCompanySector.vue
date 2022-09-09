<template>
  <div class="account-company-sector">
    <div class="account-company-sector__tags">
      <unnnic-tag
        v-for="service in services"
        :key="service.id"
        :text="service.title"
        scheme="aux-blue"
        class="item"
        :class="{ break: service.break }"
        @click="selectSector(service)"
        clickable
        :disabled="service.disabled"
      />
    </div>

    {{ selectedItem }}

    <unnnic-input />
  </div>
</template>

<script>
import { AccountInitOptions } from '../AccountInitOptions';
export default {
  data() {
    return {
      isInputVisible: false,
      services: [],
      selectedItem: {},
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

  &__tags {
    display: flex;
    justify-content: center;

    flex-wrap: wrap;
    gap: 15px;
  }
}
</style>
