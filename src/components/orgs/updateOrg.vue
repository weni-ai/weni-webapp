<template>
  <div class="weni-upate-org">
    <h1> Alterar nome </h1>
    <h2> Altere o nome e descrição da sua organização, deixe de uma maneira fácil para que os membros a encontrem facilmente. </h2>
    <div class="weni-upate-org__separator">
    <unnnic-input label="Nome da organização" v-model="name" />
    <unnnic-input label="Descrição" v-model="description" />
    <unnnic-button :disabled="canSave" type="terciary"> Salvar alterações </div>
  </div>
</template>

<script>
import { unnnicInput, unnnicButton } from 'unnic-system-beta';
export default {
  name: 'UpdateOrg',
  components: { unnnicInput, unnnicButton },
  props: {
    org: {
      type: Object,
      required: true,
    },
  }
}
</script>