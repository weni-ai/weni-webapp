<template>
  <div class="account-info">
    <div class="account-info__content">
      <unnnic-input
        :label="$t('account.init.info.cellphone.title')"
        :placeholder="$t('account.init.info.cellphone.placeholder')"
      />
      <unnnic-input
        :label="$t('account.init.info.company.name.title')"
        :placeholder="$t('account.init.info.company.name.placeholder')"
      />
      <unnnic-select
        :label="$t('account.init.info.company.size.title')"
        :placeholder="$t('account.init.info.company.size.placeholder')"
        v-model="companySize"
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
      />
    </div>

    <unnnic-button
      type="secondary"
      size="small"
      @click="
        $emit('handleNextStepAccount', {
          name,
          companyName,
          companySector,
          companySize,
        })
      "
    >
      {{ $t('orgs.create.next') }}
    </unnnic-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      companyName: '',
      companySector: '',
      companySize: null,
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
