<template>
  <container class="billing" type="full">
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
            {{ $t('billing.title', { name: currentOrg.name }) }}
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
              <div class="title">{{ $t('billing.payment.plans.free') }}</div>
              <div class="description">
                {{
                  $t('billing.payment.contracted_in', {
                    date: '25',
                    month: '12',
                    year: '2021',
                  })
                }}
              </div>

              <unnnic-button type="secondary" class="button">
                {{ $t('billing.payment.change_plan') }}
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

                    <div class="strong">0</div>

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
                    <div class="strong">147</div>
                  </div>
                  <div class="description">
                    {{ $t('billing.payment.current_active_contacts') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="visual-card">
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
      </template>

      <template slot="tab-head-invoices">
        {{ $t('billing.revenues.invoices') }}
      </template>

      <template slot="tab-panel-invoices">
        <unnnic-table
          :items="tableInvoicesItems"
          :loading="loading"
          class="invoices-table"
        >
          <template v-slot:header>
            <unnnic-table-row :headers="tableInvoicesHeaders">
              <template v-slot:checkarea>
                <unnnic-checkbox
                  :value="generalValue(tableInvoicesItems)"
                  @change="changeGeneralCheckbox($event, 'tableInvoicesItems')"
                  class="checkbox"
                />
              </template>

              <template v-slot:view>
                <div class="action">
                  {{ $t('billing.invoices.view') }}
                </div>
              </template>
            </unnnic-table-row>
          </template>

          <template v-slot:item="{ item }">
            <unnnic-table-row :headers="tableInvoicesHeaders">
              <template v-slot:checkarea>
                <unnnic-checkbox v-model="item.selected" class="checkbox" />
              </template>

              <template v-slot:lastEvent>
                <span :title="item.lastEvent">
                  {{ item.lastEvent }}
                </span>
              </template>

              <template v-slot:payment>
                <span :title="item.payment">
                  {{ item.payment }}
                </span>
              </template>

              <template v-slot:paymentStatus>
                <span :title="item.paymentStatus">
                  <unnnic-icon-svg
                    size="sm"
                    icon="indicator"
                    :scheme="
                      {
                        confirmed: 'feedback-green',
                        cancelled: 'feedback-red',
                        pending: 'feedback-yellow',
                        reversed: 'feedback-yellow',
                      }[item.paymentStatus]
                    "
                  />

                  {{ $t(`billing.invoices.statuses.${item.paymentStatus}`) }}
                </span>
              </template>

              <template v-slot:contacts>
                <span :title="item.contacts">
                  {{ item.contacts }}
                </span>
              </template>

              <template v-slot:value>
                <span :title="item.value">
                  {{ item.value }}
                </span>
              </template>

              <template v-slot:view>
                <div class="action">
                  <unnnic-button
                    size="small"
                    type="secondary"
                    iconCenter="view-1-1"
                  />
                </div>
              </template>
            </unnnic-table-row>
          </template>
        </unnnic-table>
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
import { mapGetters } from 'vuex';

export default {
  components: {
    Container,
  },

  data() {
    return {
      tab: 'payment',

      tableInvoicesItems: [
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'confirmed',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'cancelled',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'pending',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'reversed',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
      ],

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

  computed: {
    ...mapGetters(['currentOrg']),

    tableInvoicesHeaders() {
      return [
        {
          id: 'checkarea',
          text: '',
          width: '32px',
        },
        {
          id: 'lastEvent',
          text: this.$t('billing.invoices.last_event'),
          flex: 1,
        },
        {
          id: 'payment',
          text: this.$t('billing.invoices.payment_used'),
          flex: 1,
        },
        {
          id: 'paymentStatus',
          text: this.$t('billing.invoices.payment_status'),
          flex: 1,
        },
        {
          id: 'contacts',
          text: this.$t('billing.invoices.active_contacts'),
          flex: 1,
        },
        {
          id: 'value',
          text: this.$t('billing.invoices.value'),
          flex: 1,
        },
        {
          id: 'view',
          text: this.$t('billing.invoices.view'),
          width: '67px',
        },
      ];
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
        return this.tableInvoicesItems.filter((item) => item.selected).length;
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

    .contacts-table,
    .invoices-table {
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

.unnnic-grid-lg {
  padding: 0;
  grid-row-gap: $unnnic-spacing-stack-xs;
}
</style>
