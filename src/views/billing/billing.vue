<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <Container
    class="billing"
    type="full"
  >
    <BillingSkeleton v-show="loadingPage" />

    <div
      v-show="!loadingPage"
      class="header"
    >
      <div
        class="unnnic-grid-lg"
        :style="{ width: '100%' }"
      >
        <div class="unnnic-grid-span-4 title-container">
          <div class="back-button">
            <UnnnicIconSvg
              size="md"
              icon="keyboard_backspace"
              scheme="neutral-darkest"
              clickable
              @click="
                $router.push({
                  name: 'projects',
                  params: { orgUuid: currentOrg.uuid },
                })
              "
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
          <UnnnicButton
            :text="`Exportar seleção (${totalSelected})`"
            type="secondary"
            iconLeft="upload-bottom-1"
            :disabled="totalSelected === 0"
            class="button"
          />
        </div>
      </div>
    </div>

    <UnnnicTab
      v-show="!loadingPage"
      v-model="tab"
      :tabs="tabs"
      class="tabs"
    >
      <template #tab-head-payment>
        {{ $t('billing.revenues.payment') }}
      </template>

      <template #tab-panel-payment>
        <div class="cards">
          <div class="card">
            <div class="plan">
              <div class="title">
                {{
                  $t(
                    `billing.payment.plans.${currentOrg.organization_billing.plan}.title`,
                  )
                }}
              </div>
              <div class="description">
                <template
                  v-if="currentOrg.organization_billing.termination_date"
                >
                  {{
                    $t(
                      'billing.payment.terminated_on',
                      dateToObject(
                        currentOrg.organization_billing.termination_date,
                      ),
                    )
                  }}
                </template>

                <template
                  v-else-if="currentOrg.organization_billing.contract_on"
                >
                  {{
                    $t(
                      'billing.payment.contracted_on',
                      dateToObject(currentOrg.organization_billing.contract_on),
                    )
                  }}
                </template>
              </div>

              <div class="actions">
                <UnnnicButton
                  v-if="currentOrg.organization_billing.plan === 'enterprise'"
                  type="secondary"
                  class="button"
                  @click="isModalContactSupportOpen = true"
                  ref="closePlanButton"
                >
                  {{ $t('billing.payment.contact_suport') }}
                </UnnnicButton>

                <template v-else>
                  <UnnnicButton
                    v-if="
                      currentOrg.organization_billing.plan === 'enterprise' &&
                      currentOrg.organization_billing.is_active
                    "
                    @click="openClosePlanConfirmModal"
                    type="tertiary"
                    scheme="feedback-green"
                    class="button danger"
                    ref="closePlanButton"
                  >
                    {{ $t('billing.payment.close_plan') }}
                  </UnnnicButton>

                  <UnnnicButton
                    @click="openChangePlanModal"
                    :type="
                      currentOrg.organization_billing.is_active
                        ? 'secondary'
                        : 'tertiary'
                    "
                    class="button"
                    ref="changePlanButton"
                  >
                    {{ $t('billing.payment.change_plan') }}
                  </UnnnicButton>

                  <UnnnicButton
                    v-if="
                      currentOrg.organization_billing.plan === 'enterprise' &&
                      !currentOrg.organization_billing.is_active
                    "
                    @click="openReactivePlanConfirmModal"
                    type="secondary"
                    scheme="feedback-green"
                    class="button"
                  >
                    {{ $t('billing.payment.reactive_plan') }}
                  </UnnnicButton>
                </template>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="countable-infos">
              <div class="countable-info">
                <div class="icon">
                  <UnnnicIconSvg
                    size="md"
                    icon="paid"
                    scheme="neutral-cloudy"
                  />
                </div>

                <div class="data">
                  <div class="value">
                    <div class="pre-value">R$</div>

                    <div class="strong">
                      <template
                        v-if="
                          currentOrg.organization_billing.plan === 'enterprise'
                        "
                        >—</template
                      >

                      <template v-else>
                        {{
                          formatNumber(
                            currentOrg.organization_billing.currenty_invoice
                              .amount_currenty,
                            'money',
                          )
                        }}
                      </template>
                    </div>
                  </div>
                  <div class="description">
                    <template
                      v-if="
                        currentOrg.organization_billing.plan === 'enterprise'
                      "
                    >
                      {{ $t('billing.payment.consult_financial') }}
                    </template>

                    <template v-else>
                      {{ $t('billing.payment.current_value') }}
                    </template>
                  </div>
                </div>
              </div>

              <div class="countable-info">
                <div class="icon">
                  <UnnnicIconSvg
                    size="md"
                    icon="person"
                    scheme="neutral-cloudy"
                  />
                </div>

                <div class="data">
                  <div class="value">
                    <div class="strong">
                      {{
                        formatNumber(
                          currentOrg.organization_billing.currenty_invoice
                            .total_contact,
                        )
                      }}
                    </div>
                  </div>
                  <div class="description">
                    {{
                      $t(
                        `billing.payment.${
                          currentOrg.organization_billing.plan_method ===
                          'attendances'
                            ? 'current_attendences'
                            : 'current_active_contacts'
                        }`,
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="currentOrg.organization_billing.card_brand"
            class="visual-card"
          >
            <div class="header">
              <div class="name">
                <div class="description">
                  {{ $t('billing.payment.holder_name') }}
                </div>

                {{ currentOrg.organization_billing.cardholder_name }}
              </div>

              <div class="logo">
                <UnnnicIconSvg
                  size="xl"
                  :icon="cardBrandIcon"
                />
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
              <UnnnicButton
                @click="openChangeCreditCardModal"
                type="secondary"
                size="large"
              >
                {{ $t('billing.edit_card') }}
              </UnnnicButton>

              <UnnnicButton
                v-if="currentOrg.organization_billing.termination_date"
                @click="openRemoveCreditCardConfirmModal"
                type="tertiary"
                size="large"
                class="feedback-red"
              >
                {{ $t('billing.remove_card') }}
              </UnnnicButton>
            </div>
          </div>

          <div
            v-else-if="currentOrg.organization_billing.plan === 'enterprise'"
            @click="openAddCreditCardModal"
            class="card add-credit-card"
          >
            <div class="content">
              <div class="icon-container">
                <UnnnicIconSvg
                  icon="add"
                  size="xl"
                  scheme="neutral-clean"
                />
              </div>

              <div class="title">{{ $t('billing.add_credit_card.title') }}</div>
            </div>
          </div>
        </div>
        <div
          v-if="currentOrg.organization_billing.plan !== 'enterprise'"
          class="last_invoices"
        >
          <div class="last_invoices__header">
            <h2 class="last_invoices__title">
              {{ $t('billing.invoices.latest') }}
            </h2>
            <a
              class="last_invoices__link"
              @click="tab = 'invoices'"
              ref="seeAllPaymentsButton"
            >
              {{ $t('common.see_all') }}
            </a>
          </div>
          <Invoices
            @state="invoicesState = $event"
            :limit="4"
            compact
            hideSorts
            hideFilters
            hideCheckbox
          />
        </div>
      </template>

      <template #tab-head-invoices>
        {{ $t('billing.revenues.invoices') }}
      </template>

      <template #tab-panel-invoices>
        <Invoices />
      </template>

      <template #tab-head-contacts>
        {{
          $t(
            `billing.revenues.${
              $store.getters.currentOrg.organization_billing.plan_method ===
              'attendances'
                ? 'attendences'
                : 'active_contacts'
            }`,
          )
        }}
        <UnnnicToolTip
          :text="$t('billing.active_contacts_info')"
          enabled
          maxWidth="18.125rem"
        >
          <UnnnicIconSvg
            size="sm"
            icon="info"
            scheme="neutral-soft"
          />
        </UnnnicToolTip>
      </template>

      <template #tab-panel-contacts>
        <ActiveContacts />
      </template>
    </UnnnicTab>

    <Modal
      v-if="isModalContactSupportOpen"
      type="info"
      @close="isModalContactSupportOpen = false"
    >
      <UnnnicIconSvg
        icon="headphones-customer-support-human-1-1"
        size="xl"
        scheme="neutral-dark"
      />

      <div class="title">{{ $t('billing.payment.contact_suport') }}</div>

      <div class="description">
        {{ $t('billing.payment.support_via') }}
        <a
          href="#"
          @click.prevent="redirectWhatsapp"
          ><b>WhatsApp</b></a
        >
        {{ $t('billing.payment.or_email') }}
        <b>suporte@weni.ai</b>&nbsp;
        <Emoji name="Winking Face" />
      </div>
    </Modal>
  </Container>
</template>

<script>
import Container from '../projects/container.vue';
import Invoices from './tabs/invoices.vue';
import ActiveContacts from './tabs/activeContacts.vue';
import BillingSkeleton from '../loadings/billing.vue';
import { mapGetters, mapActions } from 'vuex';
import { get } from 'lodash';
import Modal from '../../components/external/Modal.vue';
import Emoji from '@/components/Emoji.vue';

// Plans types: [free, enterprise, custom]

export default {
  components: {
    Container,
    Invoices,
    ActiveContacts,
    BillingSkeleton,
    Modal,
    Emoji,
  },

  data() {
    return {
      tab: 'payment',

      loadingBilling: false,
      invoicesState: '',
      reloadingOrg: false,

      loading: false,

      isModalContactSupportOpen: false,
    };
  },

  computed: {
    ...mapGetters(['currentOrg']),

    tabs() {
      const tabs = ['payment'];

      if (this.currentOrg.organization_billing.plan !== 'enterprise') {
        tabs.push('invoices');
      }

      tabs.push('contacts');

      return tabs;
    },

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

    sleep(seconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1e3);
      });
    },

    async reloadCurrentOrg(secondsDelay = 0) {
      this.reloadingOrg = true;

      await this.sleep(secondsDelay);

      try {
        const { data: org } = await this.getOrg({
          uuid: this.currentOrg.uuid,
        });

        this.setCurrentOrg(org);
      } catch (error) {
        this.$router.push({ name: 'orgs' });
      }

      this.reloadingOrg = false;
    },

    redirectWhatsapp() {
      window.open('https://wa.me/558230225978', '_blank').focus();
    },

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
            placeholder: this.$t('billing.close_plan_modal.placeholder'),
            text: this.$t('billing.close_plan_modal.sentence'),
          },
          cancelText: this.$t('billing.close_plan_modal.buttons.cancel'),
          confirmText: this.$t('billing.close_plan_modal.buttons.save'),
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            try {
              await this.closeOrganizationPlan({
                organizationUuid: this.currentOrg.uuid,
              });

              this.reloadCurrentOrg();

              this.openModal({
                type: 'alert',
                data: {
                  icon: 'check_circle',
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
            placeholder: this.$t('billing.reactive_plan_modal.placeholder'),
            text: this.$t('billing.reactive_plan_modal.sentence'),
          },
          cancelText: this.$t('billing.reactive_plan_modal.buttons.cancel'),
          confirmText: this.$t('billing.reactive_plan_modal.buttons.save'),
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            try {
              await this.reactiveOrganizationPlan({
                organizationUuid: this.currentOrg.uuid,
              });

              this.reloadCurrentOrg();

              this.openModal({
                type: 'alert',
                data: {
                  icon: 'check_circle',
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

              this.reloadCurrentOrg(3);

              this.openModal({
                type: 'alert',
                data: {
                  icon: 'check_circle',
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

    openChangePlanModal() {
      this.$store.state.BillingSteps.flow = 'change-plan';
      this.$router.push(`/orgs/${this.currentOrg.uuid}/billing/plans`);
    },

    openAddCreditCardModal() {
      this.$store.state.BillingSteps.flow = 'add-credit-card';
      this.$router.push(`/orgs/${this.currentOrg.uuid}/billing/card`);
    },

    openChangeCreditCardModal() {
      this.$store.state.BillingSteps.flow = 'change-credit-card';
      this.$router.push(`/orgs/${this.currentOrg.uuid}/billing/card`);
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
  },
};
</script>

<style lang="scss" scoped>
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
      :deep(.header) {
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

          .unnnic-button--tertiary.feedback-red {
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
        height: 11rem;
        box-sizing: border-box;

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
