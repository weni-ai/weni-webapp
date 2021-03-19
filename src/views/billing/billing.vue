<template>
  <div class="billing">
    <div class="container">
      <div class="unnnic-grid-span-12 content">
        <div class="header">
          <div class="unnnic-grid-lg">
            <div class="unnnic-grid-span-4 title-container">
              <div class="back-button">
                <unnnic-icon-svg
                  size="md"
                  icon="keyboard-arrow-left-1"
                  scheme="neutral-darkest"
                  clickable
                />
              </div>

              <div class="title">
                Contatos na Weni

                <unnnic-tool-tip
                  text="O número de contatos dentro de um projeto indica a quantidade de pessoas que já enviaram alguma mensagem para as inteligências no projeto."
                  enabled
                  maxWidth="18.125rem"
                >
                  <unnnic-icon-svg
                    size="sm"
                    icon="information-circle-4"
                    scheme="neutral-soft"
                  />
                </unnnic-tool-tip>
              </div>
            </div>

            <div class="unnnic-grid-span-6 subtitle-container">
              <div class="subtitle">
                Visualize a quantidade de contatos em seus projetos ou exporte-os em uma planilha para uma visualização mais detalhada.
              </div>
            </div>

            <div class="unnnic-grid-span-3 export-button-container">
              <unnnic-button
                :text="`Exportar seleção (${ totalSelected })`"
                type="secondary"
                iconLeft="upload-bottom-1"
                :disabled="totalSelected === 0"
                class="button"
              />
            </div>
          </div>
        </div>

        <div class="line"></div>

        <div class="contacts-table-container">
          <unnnic-table
            :items="table.items"
            :loading="loading"
            class="contacts-table"
          >
            <template v-slot:header>
              <unnnic-table-row :headers="table.headers">
                <template v-slot:checkarea>
                  <unnnic-checkbox :value="generalValue" @change="changeGeneralCheckbox" class="checkbox"/>
                </template>
              </unnnic-table-row>
            </template>

            <template v-slot:item="{ item }">
              <unnnic-table-row :headers="table.headers">
                <template v-slot:checkarea>
                  <unnnic-checkbox v-model="item.selected" class="checkbox"/>
                </template>

                <template v-slot:project>
                  <span :title="item.project">
                    {{ item.project }}
                  </span>
                </template>

                <template v-slot:contacts>
                  <span :title="item.contacts">
                    {{ item.contacts }}
                  </span>
                </template>

                <template v-slot:export>
                  <unnnic-button
                    size="small"
                    type="secondary"
                    iconCenter="upload-bottom-1"
                  />
                </template>
              </unnnic-table-row>
            </template>
          </unnnic-table>
        </div>
      </div>
    </div>

    <footer />
  </div>
</template>

<script>
import {
  unnnicTable,
  unnnicTableRow,
  unnnicButton,
  unnnicCheckbox,
} from 'unnic-system-beta';

export default {
  components: {
    unnnicTable,
    unnnicTableRow,
    unnnicButton,
    unnnicCheckbox,
  },

  data() {
    return {
      table: {
        headers: [
          {
            id: 'checkarea',
            text: '',
            width: '32px',
          },
          {
            id: 'project',
            text: 'Projeto',
            flex: 1,
          },
          {
            id: 'contacts',
            text: 'Nº Contatos',
            flex: 1,
          },
          {
            id: 'export',
            text: 'Exportar',
            width: '55px',
          },
        ],
        items: [
          {
            selected: false,
            project: 'Funil de Marketing Digital',
            contacts: '125.256.325',
          },
          {
            selected: false,
            project: 'Juntando vetores',
            contacts: '35.251',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
          {
            selected: false,
            project: 'Hospital Unimed',
            contacts: '12.478',
          },
        ],
      },

      loading: false,
    };
  },

  computed: {
    generalValue() {
      if (!this.table.items.find((item) => item.selected)) {
        return false;
      }

      if (!this.table.items.find((item) => !item.selected)) {
        return true;
      }

      return 'less';
    },

    totalSelected() {
      return this.table.items.filter(item => item.selected).length;
    },
  },

  methods: {
    changeGeneralCheckbox(value) {
      this.table.items = this.table.items.map((item) => ({
        ...item,
        selected: value,
      }));
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~unnic-system-beta/src/assets/scss/unnnic.scss';

.billing {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .container {
    flex: 1;
    margin: 0 12.88%;
    margin-top: $unnnic-spacing-stack-md;
    margin-bottom: $unnnic-spacing-stack-lg;

    .content {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 0.5rem - 32px - 24px);
    }

    .header {
      display: flex;

      .back-button {
        width: 40px;
        min-width: 40px;
        line-height: 40px;
      }

      .title-container {
        display: flex;
        
        .title {
          color: $unnnic-color-neutral-black;
          font-family: $unnnic-font-family-primary;
          font-weight: $unnnic-font-weight-regular;
          font-size: $unnnic-font-size-title-lg;
          line-height: $unnnic-font-size-title-lg + $unnnic-line-height-md;
        }
      }

      .subtitle-container {
        grid-row-start: 2;
        padding-left: 40px;

        .subtitle {
          color: $unnnic-color-neutral-dark;
          font-family: $unnnic-font-family-secondary;
          font-weight: $unnnic-font-weight-regular;
          font-size: $unnnic-font-size-body-lg;
          line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        }
      }

      .export-button-container {
        align-self: center;
        grid-column-end: 13;
        grid-row: 1 / 3;

        .button {
          min-width: 100%;
        }
      }
    }

    .contacts-table-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 215px;

      .contacts-table {
        flex: 1;
        height: 1px;

        .checkbox {
          margin: 0.25rem;
        }
      }
    }
  }


  .line {
    height: 1px;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0;
  }
}

.unnnic-grid-lg {
  padding: 0;
  grid-row-gap: $unnnic-spacing-stack-xs;
}

footer {
  height: 0.5rem;
  background-color: $unnnic-color-brand-weni;
}
</style>