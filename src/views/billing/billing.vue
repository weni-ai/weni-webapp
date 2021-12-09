<template>
  <container class="billing" type="full">
    <billing-skeleton v-show="loadingPage" />

    <div v-show="!loadingPage" class="header">
      <div class="unnnic-grid-lg" :style="{ width: '100%' }">
        <div class="unnnic-grid-span-4 title-container">
          <div class="back-button">
            <unnnic-icon-svg
              size="md"
              icon="keyboard-arrow-left-1"
              scheme="neutral-darkest"
              clickable
              @click="$router.go(-1)"
            />
          </div>

          <div class="title">
            {{ $t('billing.title', { name: orgName }) }}
          </div>
        </div>

        <div
          :style="{
            opacity: Number(showExportButton),
            pointerEvents: showExportButton ? null : 'none',
          }"
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
      v-show="!loadingPage"
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
                {{ $t(`billing.payment.plans.${currentOrg.organization_billing.plan}`) }}
              </div>
              <div class="description">
                <template v-if="currentOrg.organization_billing.termination_date">
                  {{
                    $t(
                      'billing.payment.terminated_on',
                      dateToObject(currentOrg.organization_billing.termination_date),
                    )
                  }}
                </template>

                <template v-else-if="currentOrg.organization_billing.contracted_on">
                  <!-- It doesn't exist yet -->
                  {{
                    $t(
                      'billing.payment.contracted_on',
                      dateToObject(currentOrg.organization_billing.contracted_on),
                    )
                  }}
                </template>
              </div>

              <div class="actions">
                <unnnic-button
                  v-if="currentOrg.organization_billing.plan === 'custom'"
                  type="secondary"
                  class="button"
                >
                  {{ $t('billing.payment.contact_suport') }}
                </unnnic-button>

                <template v-else>
                  <unnnic-button
                    v-if="currentOrg.organization_billing.plan === 'enterprise' && currentOrg.organization_billing.is_active"
                    @click="openClosePlanConfirmModal"
                    type="terciary"
                    scheme="feedback-green"
                    class="button danger"
                  >
                    {{ $t('billing.payment.close_plan') }}
                  </unnnic-button>

                  <unnnic-button
                    @click="openChangePlanModal"
                    :type="currentOrg.organization_billing.is_active ? 'secondary' : 'terciary'"
                    class="button"
                  >
                    {{ $t('billing.payment.change_plan') }}
                  </unnnic-button>

                  <unnnic-button
                    v-if="currentOrg.organization_billing.plan === 'enterprise' && !currentOrg.organization_billing.is_active"
                    @click="openReactivePlanConfirmModal"
                    type="secondary"
                    scheme="feedback-green"
                    class="button"
                  >
                    {{ $t('billing.payment.reactive_plan') }}
                  </unnnic-button>
                </template>
              </div>
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
                    <div class="pre-value">$</div>

                    <div class="strong">
                      {{
                        formatNumber(
                          currentOrg.organization_billing.currenty_invoice.amount_currenty,
                          'money',
                        )
                      }}
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
                      {{
                        formatNumber(
                          currentOrg.organization_billing.currenty_invoice.total_contact,
                        )
                      }}
                    </div>
                  </div>
                  <div class="description">
                    {{ $t('billing.payment.current_active_contacts') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentOrg.organization_billing.card_brand" class="visual-card">
            <div class="header">
              <div class="name">
                <div class="description">
                  {{ $t('billing.payment.holder_name') }}
                </div>

                {{ currentOrg.organization_billing.cardholder_name }}
              </div>

              <div class="logo">
                <unnnic-icon-svg size="xl" :icon="cardBrandIcon" />
              </div>
            </div>

            <div class="footer">
              <div class="number">
                <div class="description">
                  {{ $t('billing.payment.end_of_card') }}
                </div>

                •••• {{ currentOrg.organization_billing.final_card_number }}
              </div>

              <div class="number">
                <div class="description">
                  {{ $t('billing.payment.validity') }}
                </div>

                {{ currentOrg.organization_billing.card_expiration_date }}
              </div>
            </div>

            <div class="content">
              <unnnic-button
                @click="openChangeCreditCardModal"
                type="secondary"
                size="large"
              >
                {{ $t('billing.edit_card') }}
              </unnnic-button>

              <unnnic-button
                v-if="currentOrg.organization_billing.termination_date"
                @click="openRemoveCreditCardConfirmModal"
                type="terciary"
                size="large"
                class="feedback-red"
              >
                {{ $t('billing.remove_card') }}
              </unnnic-button>
            </div>
          </div>

          <div
            v-else-if="currentOrg.organization_billing.plan === 'enterprise'"
            @click="openAddCreditCardModal"
            class="card add-credit-card"
          >
            <div class="content">
              <div class="icon-container">
                <unnnic-icon-svg
                  icon="add-1"
                  size="xl"
                  scheme="neutral-clean"
                />
              </div>

              <div class="title">{{ $t('billing.add_credit_card.title') }}</div>
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
          <Invoices
            @state="invoicesState = $event"
            :limit="4"
            compact
            hide-sorts
            hide-filters
            hide-checkbox
          />
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
        <active-contacts />
      </template>
    </unnnic-tab>

    <billing-create-org
      v-if="isChangePlanOpen"
      flow="change-plan"
      show-close
      @close="isChangePlanOpen = false"
      @credit-card-changed="reloadCurrentOrg"
      @organization-changed="reloadCurrentOrg(0)"
    />

    <billing-create-org
      v-if="isAddCreditCardOpen"
      flow="add-credit-card"
      show-close
      @close="isAddCreditCardOpen = false"
      @credit-card-changed="reloadCurrentOrg"
    />

    <billing-create-org
      v-if="isChangeCreditCardOpen"
      flow="change-credit-card"
      show-close
      @close="isChangeCreditCardOpen = false"
      @credit-card-changed="reloadCurrentOrg"
    />
  </container>
</template>

<script>
import Container from '../projects/container.vue';
import Invoices from './tabs/invoices.vue';
import ActiveContacts from './tabs/activeContacts.vue';
import BillingSkeleton from '../loadings/billing.vue';
import BillingCreateOrg from '@/views/billing/createOrg.vue';
import { mapGetters, mapActions } from 'vuex';
import { get } from 'lodash';

// Plans types: [free, enterprise, custom]

export default {
  components: {
    Container,
    Invoices,
    ActiveContacts,
    BillingSkeleton,
    BillingCreateOrg,
  },

  data() {
    return {
      tab: 'payment',

      loadingBilling: false,
      invoicesState: '',
      reloadingOrg: false,

      loading: false,

      isChangePlanOpen: false,
      isAddCreditCardOpen: false,
      isChangeCreditCardOpen: false,
    };
  },

  computed: {
    ...mapGetters(['currentOrg']),

    cardBrandIcon() {
      const cardBrand = this.currentOrg?.organization_billing?.card_brand;

      // [ American Express, Diners Club, Discover, JCB, MasterCard, UnionPay, Visa, Unknown ]
      // [ amex, diners, discover, jcb, mastercard, unionpay, visa, unknown ]

      const brandsToIcon = {
        amex: 'american-express',
        diners: 'diners-club',
        discover: 'discover',
        jcb: 'jcb',
        mastercard: 'mastercard',
        unionpay: 'unionpay',
        visa: 'visa',
      };

      return brandsToIcon[cardBrand] || 'generic-card';
    },

    loadingPage() {
      return this.invoicesState === 'loading' || this.reloadingOrg;
    },

    orgName() {
      return get(this.currentOrg, 'name');
    },

    totalSelected() {
      if (this.tab === 'invoices') {
        // return this.tableInvoicesItems.filter((item) => item.selected).length;
      } else if (this.tab === 'contacts') {
        // return this.tableItems.filter((item) => item.selected).length;
      }

      return 0;
    },

    showExportButton() {
      return false;
      // return ['invoices', 'contacts'].includes(this.tab);
    },
  },

  methods: {
    ...mapActions([
      'setBillingStep',
      'getOrg',
      'setCurrentOrg',
      'openModal',
      'removeCreditCard',
      'closeOrganizationPlan',
      'reactiveOrganizationPlan',
    ]),

    openClosePlanConfirmModal() {
      this.openModal({
        type: 'confirm',
        data: {
          icon: 'alert-circle-1',
          scheme: 'feedback-red',
          persistent: true,
          title: this.$t('billing.close_plan_modal.title'),
          description: this.$t('billing.close_plan_modal.description', {
            sentence: this.$t('billing.close_plan_modal.sentence'),
          }),
          validate: {
            label: this.$t('billing.close_plan_modal.label', {
              sentence: this.$t('billing.close_plan_modal.sentence'),
            }),
            placeholder: this.$t(
              'billing.close_plan_modal.placeholder',
            ),
            text: this.$t('billing.close_plan_modal.sentence'),
          },
          cancelText: this.$t(
            'billing.close_plan_modal.buttons.cancel',
          ),
          confirmText: this.$t('billing.close_plan_modal.buttons.save'),
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            try {
              await this.closeOrganizationPlan({
                organizationUuid: this.currentOrg.uuid,
              });

              this.reloadCurrentOrg(0);

              this.openModal({
                type: 'alert',
                data: {
                  icon: 'check-circle-1-1',
                  scheme: 'feedback-green',
                  title: this.$t(
                    'billing.close_plan_modal.success_modal.title',
                  ),
                  description: this.$t(
                    'billing.close_plan_modal.success_modal.description',
                  ),
                },
              });
            } catch (error) {
              console.log('error', error);

              this.genericServerErrorModal();
            }

            setLoading(false);
            justClose();
          },
        },
      });
    },

    openReactivePlanConfirmModal() {
      this.openModal({
        type: 'confirm',
        data: {
          icon: 'alert-circle-1',
          scheme: 'feedback-yellow',
          persistent: true,
          title: this.$t('billing.reactive_plan_modal.title'),
          description: this.$t('billing.reactive_plan_modal.description', {
            sentence: this.$t('billing.reactive_plan_modal.sentence'),
          }),
          validate: {
            label: this.$t('billing.reactive_plan_modal.label', {
              sentence: this.$t('billing.reactive_plan_modal.sentence'),
            }),
            placeholder: this.$t(
              'billing.reactive_plan_modal.placeholder',
            ),
            text: this.$t('billing.reactive_plan_modal.sentence'),
          },
          cancelText: this.$t(
            'billing.reactive_plan_modal.buttons.cancel',
          ),
          confirmText: this.$t('billing.reactive_plan_modal.buttons.save'),
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            try {
              await this.reactiveOrganizationPlan({
                organizationUuid: this.currentOrg.uuid,
              });

              this.reloadCurrentOrg(0);

              this.openModal({
                type: 'alert',
                data: {
                  icon: 'check-circle-1-1',
                  scheme: 'feedback-green',
                  title: this.$t(
                    'billing.reactive_plan_modal.success_modal.title',
                  ),
                  description: this.$t(
                    'billing.reactive_plan_modal.success_modal.description',
                  ),
                },
              });
            } catch (error) {
              console.log('error', error);

              this.genericServerErrorModal();
            }

            setLoading(false);
            justClose();
          },
        },
      });
    },

    openRemoveCreditCardConfirmModal() {
      this.openModal({
        type: 'confirm',
        data: {
          icon: 'alert-circle-1',
          scheme: 'feedback-red',
          persistent: true,
          title: this.$t('billing.remove_credit_card_modal.title'),
          description: this.$t('billing.remove_credit_card_modal.description', {
            sentence: this.$t('billing.remove_credit_card_modal.sentence'),
          }),
          validate: {
            label: this.$t('billing.remove_credit_card_modal.label', {
              sentence: this.$t('billing.remove_credit_card_modal.sentence'),
            }),
            placeholder: this.$t(
              'billing.remove_credit_card_modal.placeholder',
            ),
            text: this.$t('billing.remove_credit_card_modal.sentence'),
          },
          cancelText: this.$t(
            'billing.remove_credit_card_modal.buttons.cancel',
          ),
          confirmText: this.$t('billing.remove_credit_card_modal.buttons.save'),
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            try {
              await this.removeCreditCard({
                organizationUuid: this.currentOrg.uuid,
              });

              this.reloadCurrentOrg();

              this.openModal({
                type: 'alert',
                data: {
                  icon: 'check-circle-1-1',
                  scheme: 'feedback-green',
                  title: this.$t(
                    'billing.remove_credit_card_modal.success_modal.title',
                  ),
                  description: this.$t(
                    'billing.remove_credit_card_modal.success_modal.description',
                  ),
                },
              });
            } catch (error) {
              console.log('error', error);

              this.genericServerErrorModal();
            }

            setLoading(false);
            justClose();
          },
        },
      });
    },

    genericServerErrorModal() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'alert-circle-1',
          scheme: 'feedback-yellow',
          title: this.$t('alerts.server_problem.title'),
          description: this.$t('alerts.server_problem.description'),
        },
      });
    },

    sleep(seconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1e3);
      });
    },

    openChangePlanModal() {
      this.isChangePlanOpen = true;
      this.setBillingStep('plans');
    },

    openAddCreditCardModal() {
      this.isAddCreditCardOpen = true;
      this.setBillingStep('credit-card');
    },

    openChangeCreditCardModal() {
      this.isChangeCreditCardOpen = true;
      this.setBillingStep('credit-card');
    },

    async reloadCurrentOrg(secondsDelay = 3) {
      this.reloadingOrg = true;

      await this.sleep(secondsDelay);

      try {
        const { data: org } = await this.getOrg({
          uuid: this.$route.params.orgUuid,
        });

        this.setCurrentOrg(org);
      } catch (error) {
        this.$router.push({ name: 'orgs' });
      } finally {
        this.reloadingOrg = false;
      }
    },

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

        &.add-credit-card {
          cursor: pointer;
          user-select: none;

          .content {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;

            .icon-container {
              margin-bottom: $unnnic-spacing-stack-xs;
            }

            .title {
              font-family: $unnnic-font-family-secondary;
              font-weight: $unnnic-font-weight-regular;
              font-size: $unnnic-font-size-body-lg;
              line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
              color: $unnnic-color-neutral-cloudy;
            }
          }
        }

        .plan {
          height: 100%;
          display: flex;
          flex-direction: column;

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

          .actions {
            display: flex;
            column-gap: $unnnic-spacing-inline-xs;
            margin-top: auto;
            padding-top: $unnnic-spacing-stack-md;

            .button {
              flex: 1;

              &.danger {
                color: $unnnic-color-feedback-red;
              }
            }
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
    margin: $unnnic-spacing-stack-md 0 $unnnic-spacing-stack-sm 0;
  }
  &__title {
    font-family: $unnnic-font-family-primary;
    color: $unnnic-color-neutral-darkest;
    font-weight: $unnnic-font-weight-regular;
    margin: 0;
    font-size: $unnnic-font-size-title-sm;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
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
