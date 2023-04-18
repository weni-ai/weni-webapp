<template>
  <div class="setup">
    <main>
      <header>
        <div class="unnnic-font secondary title-sm bold color-neutral-darkest">
          {{
            $t('projects.create.format.setup.title', {
              name: $t(`projects.create.format.${template.name}.title`),
            })
          }}
        </div>

        <div class="unnnic-font secondary body-lg color-neutral-cloudy">
          {{ $t(`projects.create.format.${template.name}.description`) }}
        </div>
      </header>

      <form @submit.prevent="submit">
        <unnnic-input-next
          v-for="field in template.setup.fields"
          :key="field.name"
          size="md"
          v-model="localValues[field.name]"
          :label="field.label || field.name"
          :native-type="field.type"
          :allow-toggle-password="field.type === 'password'"
          :error="error(localValues[field.name], field.rules)"
        />

        <unnnic-button :disabled="disabled" type="secondary">
          {{ $t('projects.create.format.setup.complete') }}
        </unnnic-button>
      </form>
    </main>

    <div class="image">
      <img :src="template.setup.image.src" />

      <div class="unnnic-font secondary body-sm color-neutral-cloudy">
        {{ template.setup.image.description }}
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
    template: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  data() {
    return {
      localValues: {},
    };
  },

  computed: {
    disabled() {
      return this.template.setup.fields.some(
        ({ name, rules }) =>
          !this.localValues[name] || this.error(this.localValues[name], rules),
      );
    },
  },

  methods: {
    changeValue(name, value) {
      this.localValues[name] = value;
    },

    error(value, rules) {
      if (!rules) {
        return false;
      }

      if (!value.length) {
        return false;
      }

      if (rules.minLength) {
        if (value.length < rules.minLength) {
          return this.$t('errors.min_characters', {
            characters: rules.minLength,
          });
        }
      }

      if (rules.contains) {
        if (
          rules.contains === 'letters,numbers' &&
          !/^[A-z0-9]+$/.test(value)
        ) {
          return this.$t('errors.letters,numbers');
        } else if (rules.contains === 'numbers' && !/^[0-9]+$/.test(value)) {
          return this.$t('errors.numbers');
        }
      }
    },

    submit() {
      const values = {};

      this.template.setup.fields
        .map(({ name }) => name)
        .forEach((name) => {
          values[name] = this.localValues[name];
        });

      this.$emit('submit', values);
    },
  },

  watch: {
    'template.setup.fields': {
      immediate: true,

      deep: true,

      handler() {
        this.template.setup.fields
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
      .unnnic-input + .unnnic-input {
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
    border-radius: $unnnic-border-radius-sm;
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
