<template>
  <container v-if="loadingPage" class="billing" type="full">
    Loading...
  </container>

  <container v-else class="billing" type="full">
    <div class="header">
      <div class="unnnic-grid-lg" :style="{ width: '100%' }">
        <div class="unnnic-grid-span-4 title-container">
          <div class="back-button">
            <unnnic-icon-svg
              size="md"
              icon="keyboard-arrow-left-1"
              scheme="neutral-darkest"
              clickable
              @click="$router.push({ name: 'orgs' })"
            />
          </div>

          <div class="title">
            {{ $t('billing.title', { name: orgName }) }}
          </div>
        </div>

        <div
          v-if="showExportButton"
          class="unnnic-grid-span-3 export-button-container"
        >
          <unnnic-button
            :text="`Exportar seleção (${totalSelected})`"
            type="secondary"
            iconLeft="upload-bottom-1"
            :disabled="totalSelected === 0"
            class="button"
          />
        </div>
      </div>
    </div>

    <unnnic-tab
      v-model="tab"
      :tabs="['payment', 'invoices', 'contacts']"
      class="tabs"
    >
      <template slot="tab-head-payment">
        {{ $t('billing.revenues.payment') }}
      </template>

      <template slot="tab-panel-payment">
        <div class="cards">
          <div class="card">
            <div class="plan">
              <div class="title">
                {{ $t(`billing.payment.plans.${billing.plan}`) }}
              </div>
              <div class="description">
                {{
                  $t(
                    'billing.payment.contracted_on',
                    dateToObject(billing.contractedOn),
                  )
                }}
              </div>

              <unnnic-button type="secondary" class="button">
                {{
                  billing.plan === 'custom'
                    ? $t('billing.payment.contact_suport')
                    : $t('billing.payment.change_plan')
                }}
              </unnnic-button>
            </div>
          </div>

          <div class="card">
            <div class="countable-infos">
              <div class="countable-info">
                <div class="icon">
                  <unnnic-icon-svg
                    size="md"
                    icon="currency-dollar-circle-1"
                    scheme="neutral-cloudy"
                  />
                </div>

                <div class="data">
                  <div class="value">
                    <div class="pre-value">R$</div>

                    <div class="strong">
                      {{ formatNumber(billing.invoiceAmount, 'money') }}
                    </div>

                    <div class="info-tooltip">
                      <unnnic-tool-tip
                        text="O número de contatos ativos indica a quantidade de pessoas que já interagiram com seus projetos."
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
                  <div class="description">
                    {{ $t('billing.payment.current_value') }}
                  </div>
                </div>
              </div>

              <div class="countable-info">
                <div class="icon">
                  <unnnic-icon-svg
                    size="md"
                    icon="single-neutral-actions-1"
                    scheme="neutral-cloudy"
                  />
                </div>

                <div class="data">
                  <div class="value">
                    <div class="strong">
                      {{ formatNumber(billing.activeContacts) }}
                    </div>
                  </div>
                  <div class="description">
                    {{ $t('billing.payment.current_active_contacts') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="billing.plan === 'paid'" class="visual-card">
            <div class="header">
              <div class="name">
                <div class="description">
                  {{ $t('billing.payment.holder_name') }}
                </div>
                Filipe Esteves
              </div>

              <div class="logo">
                <unnnic-icon-svg size="xl" icon="mastercard" />
              </div>
            </div>

            <div class="footer">
              <div class="number">
                <div class="description">
                  {{ $t('billing.payment.end_of_card') }}
                </div>
                •••• 2468
              </div>

              <div class="number">
                <div class="description">
                  {{ $t('billing.payment.validity') }}
                </div>
                12/28
              </div>
            </div>

            <div class="content">
              <unnnic-button type="secondary" size="large">
                {{ $t('billing.edit_card') }}
              </unnnic-button>

              <unnnic-button type="terciary" size="large" class="feedback-red">
                {{ $t('billing.remove_card') }}
              </unnnic-button>
            </div>
          </div>
        </div>
        <div class="last_invoices">
          <div class="last_invoices__header">
            <h2 class="last_invoices__title">Últimas faturas</h2>
            <a class="last_invoices__link" @click="tab = 'invoices'">
              Ver tudo
            </a>
          </div>
          <Invoices compact />
        </div>
      </template>

      <template slot="tab-head-invoices">
        {{ $t('billing.revenues.invoices') }}
      </template>

      <template slot="tab-panel-invoices">
        <invoices />
      </template>

      <template slot="tab-head-contacts">
        {{ $t('billing.revenues.active_contacts') }}
        <unnnic-tool-tip
          text="O número de contatos ativos indica a quantidade de pessoas que já interagiram com seus projetos."
          enabled
          maxWidth="18.125rem"
        >
          <unnnic-icon-svg
            size="sm"
            icon="information-circle-4"
            scheme="neutral-soft"
          />
        </unnnic-tool-tip>
      </template>

      <template slot="tab-panel-contacts">
        <unnnic-table
          :items="tableItems"
          :loading="loading"
          class="contacts-table"
        >
          <template v-slot:header>
            <unnnic-table-row :headers="tableHeaders">
              <template v-slot:checkarea>
                <unnnic-checkbox
                  :value="generalValue(tableItems)"
                  @change="changeGeneralCheckbox($event, 'tableItems')"
                  class="checkbox"
                />
              </template>
            </unnnic-table-row>
          </template>

          <template v-slot:item="{ item }">
            <unnnic-table-row :headers="tableHeaders">
              <template v-slot:checkarea>
                <unnnic-checkbox v-model="item.selected" class="checkbox" />
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
                <div class="action">
                  <unnnic-button
                    size="small"
                    type="secondary"
                    iconCenter="upload-bottom-1"
                  />
                </div>
              </template>
            </unnnic-table-row>
          </template>
        </unnnic-table>
      </template>
    </unnnic-tab>
  </container>
</template>

<script>
import Container from '../projects/container.vue';
import Invoices from './tabs/invoices.vue';
import { mapGetters, mapActions } from 'vuex';
import { get, isEmpty } from 'lodash';

export default {
  components: {
    Container,
    Invoices,
  },

  data() {
    return {
      tab: 'payment',

      loadingOrg: false,
      loadingBilling: false,

      billing: {
        plan: 'custom', // [free, enterprise, custom]
        contractedOn: '2021-09-28',
        activeContacts: 2047,
        invoiceAmount: 1253100.5,
      },

      tableItems: [
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

      loading: false,
    };
  },

  async mounted() {
    if (isEmpty(this.currentOrg)) {
      try {
        this.loadingOrg = true;
        const { data: org } = await this.getOrg({
          uuid: this.$route.params.orgUuid,
        });
        this.setCurrentOrg(org);
      } catch (error) {
        this.$router.push({ name: 'orgs' });
      } finally {
        this.loadingOrg = false;
      }
    }
  },

  computed: {
    ...mapGetters(['currentOrg']),

    loadingPage() {
      return this.loadingOrg; // && this.loadingBilling
    },

    orgName() {
      return get(this.currentOrg, 'name');
    },

    tableHeaders() {
      return [
        {
          id: 'checkarea',
          text: '',
          width: '32px',
        },
        {
          id: 'project',
          text: this.$t('billing.active_contacts.project'),
          flex: 1,
        },
        {
          id: 'contacts',
          text: this.$t('billing.active_contacts.number_of_contacts'),
          flex: 1,
        },
        {
          id: 'export',
          text: this.$t('billing.active_contacts.export'),
          width: '55px',
        },
      ];
    },

    totalSelected() {
      if (this.tab === 'invoices') {
        // return this.tableInvoicesItems.filter((item) => item.selected).length;
      } else if (this.tab === 'contacts') {
        return this.tableItems.filter((item) => item.selected).length;
      }

      return 0;
    },

    showExportButton() {
      return ['invoices', 'contacts'].includes(this.tab);
    },
  },

  methods: {
    ...mapActions(['getOrg', 'setCurrentOrg']),

    dateToObject(date) {
      const parts = date.split('-');

      return {
        date: parts[2],
        month: parts[1],
        year: parts[0],
      };
    },

    formatNumber(number, type) {
      return Number(number).toLocaleString(this.$i18n.locale, {
        minimumFractionDigits: type === 'money' ? 2 : 0,
      });
    },

    generalValue(items) {
      if (!items.find((item) => item.selected)) {
        return false;
      }

      if (!items.find((item) => !item.selected)) {
        return true;
      }

      return 'less';
    },

    changeGeneralCheckbox(value, table) {
      this[table] = this[table].map((item) => ({
        ...item,
        selected: value,
      }));
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing {
  display: flex;
  flex-direction: column;

  .container {
    flex: 1;
    margin: 0 12.88%;
    margin-top: $unnnic-spacing-stack-md;
    margin-bottom: $unnnic-spacing-stack-lg;

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

    .tabs {
      margin-top: $unnnic-spacing-stack-md;
    }

    .contacts-table {
      ::v-deep .header {
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .checkbox {
        margin: 0.25rem;
      }

      .action {
        text-align: center;
      }

      .dropdown {
        position: relative;

        .dropdown-data {
          position: absolute;
          pointer-events: none;
          display: none;
          left: 100%;
          top: 100%;
        }

        &.active .dropdown-data {
          pointer-events: auto;
          display: block;
        }
      }
    }

    .cards {
      display: grid;
      gap: $unnnic-inline-sm;
      grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));

      .visual-card {
        position: relative;
        border-radius: $unnnic-border-radius-md;
        padding: $unnnic-spacing-inset-md;
        background: linear-gradient(106.4deg, #eef0ff 1.55%, #dcf3f2 96.79%);

        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        color: $unnnic-color-neutral-darkest;

        .content {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s;
          border-radius: $unnnic-border-radius-md;
          background: rgba(249, 249, 249, 0.88);
          backdrop-filter: blur(4px);

          .unnnic-button--terciary.feedback-red {
            color: $unnnic-color-feedback-red;
          }
        }

        &:hover .content {
          opacity: 1;
        }

        .description {
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
          color: $unnnic-color-neutral-cloudy;
        }

        .header,
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer {
          margin-top: 2.25rem;
        }
      }

      .card {
        background-color: $unnnic-color-background-snow;
        border-radius: $unnnic-border-radius-md;
        padding: $unnnic-spacing-inset-md;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

        .plan {
          .title {
            font-family: $unnnic-font-family-secondary;
            font-weight: $unnnic-font-weight-black;
            font-size: $unnnic-font-size-title-md;
            line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
            color: $unnnic-color-brand-sec-dark;
          }

          .description {
            font-family: $unnnic-font-family-secondary;
            font-weight: $unnnic-font-weight-regular;
            font-size: $unnnic-font-size-body-lg;
            line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
            color: $unnnic-color-neutral-cloudy;
          }

          .button {
            margin-top: $unnnic-spacing-stack-md;
            width: 100%;
          }
        }

        .countable-infos {
          display: flex;
          flex-direction: column;
          gap: $unnnic-inline-sm;

          .countable-info {
            display: flex;
            align-items: center;
            gap: $unnnic-inline-sm;

            .icon {
              padding: $unnnic-inset-nano;
              border-radius: $unnnic-border-radius-sm;
              background-color: rgba(
                $unnnic-color-neutral-cloudy,
                $unnnic-opacity-level-extra-light
              );
            }

            .data {
              .value {
                display: flex;
                align-items: center;

                .pre-value {
                  font-family: $unnnic-font-family-secondary;
                  font-weight: $unnnic-font-weight-regular;
                  font-size: $unnnic-font-size-title-sm;
                  line-height: $unnnic-font-size-title-sm +
                    $unnnic-line-height-md;
                  color: $unnnic-color-neutral-black;
                  margin-right: $unnnic-spacing-inline-nano;
                }

                .strong {
                  font-family: $unnnic-font-family-secondary;
                  font-weight: $unnnic-font-weight-black;
                  font-size: $unnnic-font-size-title-md;
                  line-height: $unnnic-font-size-title-md +
                    $unnnic-line-height-md;
                  color: $unnnic-color-brand-sec-dark;
                }

                .info-tooltip {
                  margin-left: $unnnic-spacing-inline-xs;
                }
              }

              .description {
                font-family: $unnnic-font-family-secondary;
                font-weight: $unnnic-font-weight-regular;
                font-size: $unnnic-font-size-body-lg;
                line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
                color: $unnnic-color-neutral-cloudy;
              }
            }
          }
        }
      }
    }
  }
}
.last_invoices {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__title {
    font-family: $unnnic-font-family-primary;
    color: $unnnic-color-neutral-darkest;
    font-weight: $unnnic-font-weight-regular;
    margin: $unnnic-spacing-stack-md 0 $unnnic-spacing-stack-sm 0;
  }

  &__link {
    cursor: pointer;
    text-decoration: underline;
    font-size: $unnnic-font-size-body-gt;
    color: $unnnic-color-neutral-dark;
  }
}
.unnnic-grid-lg {
  padding: 0;
  grid-row-gap: $unnnic-spacing-stack-xs;
}
</style>
