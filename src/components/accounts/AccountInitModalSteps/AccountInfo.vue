<template>
  <div class="account-info">
    <div class="account-info__content">
      <unnnic-input
        :label="$t('account.init.info.cellphone.title')"
        :placeholder="$t('account.init.info.cellphone.placeholder')"
        :value="phone"
        @input="$emit('update:phone', $event)"
      />
      <unnnic-input
        :label="$t('account.init.info.company.name.title')"
        :placeholder="$t('account.init.info.company.name.placeholder')"
        :value="companyName"
        @input="$emit('update:company-name', $event)"
      />
      <unnnic-select
        :label="$t('account.init.info.company.size.title')"
        :placeholder="$t('account.init.info.company.size.placeholder')"
        :value="companySize"
        @input="$emit('update:company-size', $event)"
      >
        <option
          v-for="project in quantityOfPerson"
          :value="project.id"
          :key="project.id"
        >
          {{ project.title }}
        </option>
      </unnnic-select>
      <unnnic-input
        :label="$t('account.init.info.company.segment.title')"
        :placeholder="$t('account.init.info.company.segment.placeholder')"
        :value="companySegment"
        @input="$emit('update:company-segment', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    phone: {
      type: String,
    },

    companyName: String,
    companySize: String,
    companySegment: String,
  },

  data() {
    return {
      name: '',
    };
  },
  computed: {
    quantityOfPerson() {
      return [
        {
          id: 0,
          title: `1 - 20 ${this.$t(
            'account.init.info.company.size.colaborators',
          )}`,
        },
        {
          id: 1,
          title: `21 - 50 ${this.$t(
            'account.init.info.company.size.colaborators',
          )}`,
        },
        {
          id: 2,
          title: `51 - 300 ${this.$t(
            'account.init.info.company.size.colaborators',
          )}`,
        },
        {
          id: 3,
          title: `301 - 1000 ${this.$t(
            'account.init.info.company.size.colaborators',
          )}`,
        },
        {
          id: 4,
          title: `Mais de 1001 ${this.$t(
            'account.init.info.company.size.colaborators',
          )}`,
        },
      ];
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.account-info {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__content {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $unnnic-spacing-stack-sm;
    margin: $unnnic-spacing-stack-xl 0;
  }

  button {
    width: 201px;
  }
}
</style>
