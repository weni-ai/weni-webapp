<template>
  <div class="weni-update-org">
    <unnnic-input label="Nome da organização" v-model="formData.name" />
    <unnnic-input label="Descrição" v-model="formData.description" />
    <div class="weni-update-org__separator" />
    <unnnic-button
      :disabled="isSaveButtonDisabled()"
      class="weni-update-org__button"
      type="secondary"
      @click="updateOrg">
      Salvar alterações
    </unnnic-button>
  </div>
</template>

<script>
import { unnnicInput, unnnicButton } from 'unnic-system-beta';
import { mapActions } from 'vuex';
export default {
  name: 'UpdateOrg',
  components: { unnnicInput, unnnicButton },
  props: {
    org: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        name: null,
        description: null,
        loading: false,
      },
    };
  },
  mounted() {
    const { name, description } = this.org;
    this.formData = { name, description };
  },
  methods: {
    ...mapActions(['editOrg']),
    isSaveButtonDisabled() {
      if (this.loading || !this.formData.name || !this.formData.description) return true;
      return this.formData.name === this.org.name && this.formData.description === this.org.decription;
    },
    async updateOrg() {
      const { name, description } = this.formData;
      this.loading = true;
      try {
        await this.editOrg({
          uuid: this.org.uuid,
          name,
          description,
        });
        this.$emit('edited', { org: this.org.uuid, ...this.formData });
      } finally {
        this.loading = false;
      }
    },
  }
}
</script>

<style lang="scss" scoped>
 @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  .weni-update-org {
    &__button {
      width: 100%;
    }

    &__separator {
      border: 1px solid $unnnic-color-neutral-soft;
      margin: $unnnic-spacing-stack-md 0;
    }
  }
</style>