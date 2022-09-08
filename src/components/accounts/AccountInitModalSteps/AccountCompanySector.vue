<template>
  <div class="account-company-sector">
    <div class="account-company-sector__tags">
      <unnnic-tag
        v-for="service in services"
        :key="service.id"
        :text="service.title"
        scheme="feedback-blue"
        class="item"
        :class="{ break: service.break }"
        @click="selectSector"
        :disabled="service.disabled"
      />
    </div>

    <unnnic-input />
  </div>
</template>

<script>
import { AccountInitOptions } from '../AccountInitOptions';
export default {
  data() {
    return {
      isInputVisible: false,
    };
  },
  created() {
    this.services = AccountInitOptions;
  },
  methods: {
    selectSector() {
      console.log('clicoui');
      this.services = this.services.map((service) => {
        return {
          ...service,
          disabled: true,
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
