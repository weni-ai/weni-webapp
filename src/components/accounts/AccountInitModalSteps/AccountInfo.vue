<template>
  <div class="account-info">
    <div class="account-info__content">
      <unnnic-input label="Qual seu telefone?" />
      <unnnic-input label="Qual o nome da sua empresa?" />
      <unnnic-select
        label="Quantas pessoas trabalham na sua empresa?"
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
      <unnnic-input label="Qual segmento da  sua empresa?" />
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
        { id: 0, title: '1 - 20' },
        { id: 1, title: '21 - 50' },
        { id: 2, title: '51 - 300' },
        { id: 3, title: '301 - 1000' },
        { id: 4, title: 'Mais de 1001' },
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
    margin: $unnnic-spacing-stack-giant 0;
  }

  button {
    width: 201px;
  }
}
</style>
