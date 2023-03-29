<template>
  <div class="setup">
    <main>
      <header>
        <div class="unnnic-font secondary title-sm bold color-neutral-darkest">
          Configurar template Omie
        </div>

        <div class="unnnic-font secondary body-lg color-neutral-cloudy">
          Utilize um modelo pronto de fluxo de mensagens, integrado ao Whatsapp
          Demo, para capturar dados de seus clientes.
        </div>
      </header>

      <form @submit.prevent="submit">
        <unnnic-input
          v-for="field in fields"
          :key="field.name"
          size="md"
          v-model="localValues[field.name]"
          :label="field.label"
          :native-type="field.type"
          :allow-toggle-password="field.type === 'password'"
        />

        <unnnic-button type="secondary">Concluir configuração</unnnic-button>
      </form>
    </main>

    <div class="image">
      <img
        src="https://media.istockphoto.com/id/1364358321/pt/foto/developing-programming-and-coding-technologies-with-website-design-in-virtual-diagram.jpg?s=2048x2048&w=is&k=20&c=sRSjMADzMxtk8OJH7sZDiXjMK8w7c_LpXZuQ_BOpaU8="
      />

      <div class="unnnic-font secondary body-sm color-neutral-cloudy">
        Captura de Tela da Plataforma Omie. Os dados da Chave de Integração odem
        ser encontrados em Meus Aplicativos > Weni Tecnologia (mais opções).
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    /*
     * [
     *   { label: 'APP_KEY', name: 'APP_KEY', type: 'text' },
     *   { label: 'APP_SECRET', name: 'APP_SECRET', type: 'password' },
     * ]
     */
    fields: Array,
  },

  data() {
    return {
      localValues: {},
    };
  },

  methods: {
    changeValue(name, value) {
      this.localValues[name] = value;
    },

    submit() {
      const values = {};

      this.fields
        .map(({ name }) => name)
        .forEach((name) => {
          values[name] = this.localValues[name];
        });

      this.$emit('submit', values);
    },
  },

  watch: {
    fields: {
      immediate: true,

      deep: true,

      handler() {
        this.fields
          .map(({ name }) => name)
          .forEach((name) => {
            if (!this.localValues[name]) {
              this.$set(this.localValues, name, '');
            }
          });
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.setup {
  display: flex;
  gap: $unnnic-spacing-inline-lg;

  main {
    flex: 1;

    header {
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-stack-md;
      justify-content: space-between;
      margin-bottom: $unnnic-spacing-stack-md;
    }

    form {
      .unnnic-form + .unnnic-form {
        margin-top: $unnnic-spacing-stack-sm;
      }

      .unnnic-button {
        width: 100%;
        margin-top: $unnnic-spacing-stack-sm;
      }
    }
  }

  .image {
    width: 27rem;
    padding: $unnnic-spacing-inset-xs;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;

    img {
      width: 100%;
      flex: 1;
      object-fit: contain;
    }
  }

  @media screen and (max-width: 1150px) {
    flex-direction: column;

    .image {
      width: initial;

      img {
        max-height: 15rem;
      }
    }
  }
}
</style>