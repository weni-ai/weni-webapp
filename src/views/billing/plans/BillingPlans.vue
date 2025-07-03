<template>
  <Container
    type="full"
    :class="['create-org', `flow-${flow}`]"
  >
    <div
      v-if="loadingPricing && page === 'plans'"
      class="loading-plans"
    >
      <div class="header">
        <UnnnicSkeletonLoading
          height="5.5rem"
          width="65%"
        />
      </div>

      <div class="plans-container">
        <UnnnicSkeletonLoading
          v-for="i in 3"
          :key="i"
          height="31.25rem"
        />
      </div>
    </div>

    <BillingContainer
      v-show="['plans', 'card', 'address'].includes(page) && !loadingPricing"
      :title="$t(configs.title)"
      :subtitle="$t(configs.subtitle, { plan })"
    >
      <template #content>
        <PlansSelector
          v-if="page === 'plans'"
          v-model:expanded="expanded"
          :flow="flow"
          :isSettingUpIntent="isSettingUpIntent"
          @on-choose-plan="onChoosePlan"
        />

        <div
          v-show="['card', 'address'].includes(page)"
          class="billing-form"
        >
          <div
            v-if="['create-org', 'change-plan'].includes(flow)"
            class="card-container"
          >
            <BillingCard
              v-if="$route.query.plan"
              v-model:expanded="expanded"
              :type="$route.query.plan"
              hideSelect
            />
          </div>

          <div class="form-container">
            <FormCreditCard
              v-show="page === 'card'"
              ref="formCreditCard"
              v-model:errors="errors"
              :flow="flow"
            />

            <FormAddress
              v-show="page === 'address'"
              :flow="flow"
            />

            <div class="actions">
              <UnnnicButton
                v-if="['create-org', 'change-plan'].includes(flow)"
                type="secondary"
                size="large"
                :text="$t('billing.card.buttons.back')"
                @click="previous"
              />

              <UnnnicButton
                id="stripe-confirm-setup-button"
                size="large"
                :text="textNextButton"
                @click="next"
              />
            </div>

            <template v-if="page === 'card'">
              <Report
                :text="$t('billing.card.payment_day', { date: paymentDay })"
              />

              <p class="unnnic-font secondary body-gt color-neutral-cloudy">
                {{ $t('billing.card.security_payment') }}
              </p>
            </template>
          </div>
        </div>
      </template>
    </BillingContainer>
  </Container>
</template>

<script>
import Container from '@/views/projects/container.vue';
import BillingContainer from '@/views/billing/billingContainer.vue';
import BillingCard from '@/components/billing/Card.vue';
import PlansSelector from './PlansSelector.vue';
import FormCreditCard from './FormCreditCard.vue';
import FormAddress from './FormAddress.vue';
import { mapActions, mapState, mapGetters } from 'vuex';
import orgs from '../../../api/orgs';
import { StripeGroupsErrors } from './StripeGroupsErrors';
import Report from '@/components/Report.vue';
import enTranslations from '../../../locales/en';

export default {
  components: {
    Container,
    BillingContainer,
    BillingCard,
    FormCreditCard,
    FormAddress,
    Report,
    PlansSelector,
  },

  data() {
    return {
      loadingPricing: false,

      isOpenModalPrice: false,
      paidButton: false,

      errors: {
        cpfOrCnpj: '',
        name: '',
      },

      creatingPlan: null,

      clientSecret: null,
      token: null,

      extraWhatsappPrice: 0,

      isSettingUpIntent: false,

      organizationPlan: null,

      expanded: false,
    };
  },

  computed: {
    ...mapState({
      current: (state) => state.BillingSteps.currentModal,
      creationFreeLoading: (state) =>
        state.Org.loadingCreateOrg || state.Project.loadingCreateProject,
      organizationCreationError: (state) => state.Org.currentOrg.errorCreateOrg,
      projectCreationError: (state) => state.Org.currentOrg.errorCreateProject,
      users: (state) => state.BillingSteps.users,
      billing_details: (state) => state.BillingSteps.billing_details,
      profile: (state) => state.Account.profile,
      extraWhatsappIntegrations: (state) => state.BillingSteps.integrations,
    }),

    textNextButton() {
      if (this.page === 'card') {
        return this.$t('billing.card.buttons.next');
      } else if (this.page === 'address') {
        if (this.flow === 'add-credit-card') {
          return this.$t('billing.add_credit_card.buttons.save');
        } else if (this.flow === 'change-credit-card') {
          return this.$t('save_changes');
        }

        return this.$t('billing.address.buttons.done');
      }

      return '';
    },

    paymentDay() {
      const date = new Date();
      const day = 1000 * 60 * 60 * 24;
      date.setTime(date.getTime() + 30 * day);
      return date.getDate();
    },

    flow() {
      /*
        [
          'create-org',
          'change-plan',
          'add-credit-card',
          'change-credit-card',
        ]
      */

      if (this.$route.params.orgUuid === 'create') {
        return 'create-org';
      }

      return this.$store.state.BillingSteps.flow;
    },

    page() {
      const pages = {
        plans: '/plans',
        card: '/card',
        address: '/address',
        success: '/success',
      };

      return Object.keys(pages).find((key) =>
        new RegExp(`${pages[key]}/?$`).test(this.$route.path),
      );
    },

    hasAlreadyCreditCard() {
      return this.currentOrg?.organization_billing?.card_brand;
    },

    plan() {
      return this.currentOrg?.organization_billing?.plan;
    },

    ...mapGetters(['currentOrg', 'currentProject']),

    configs() {
      let title = '';
      let subtitle = '';

      if (this.page === 'plans') {
        if (this.flow === 'change-plan') {
          title = 'billing.change_plan.plans.title';
          subtitle = 'billing.change_plan.plans.subtitle';
        }

        title = 'billing.pre_org_create_title';
        subtitle = 'billing.pre_org_create_subtitle';
      } else if (this.page === 'card') {
        if (this.flow === 'add-credit-card') {
          title = 'billing.add_credit_card.title';
          subtitle = 'billing.change_credit_card.subtitle';
        } else if (this.flow === 'change-credit-card') {
          title = 'billing.change_credit_card.title';
          subtitle = 'billing.change_credit_card.subtitle';
        }

        title = 'billing.add_credit_card_title';
        subtitle = 'billing.add_credit_card_subtitle';
      } else if (this.page === 'address') {
        title = 'billing.address_title';
        subtitle = 'billing.address_subtitle';
      }

      return {
        title,
        subtitle,
      };
    },
  },

  created() {
    if (!this.flow) {
      this.$router.push({
        name: 'billing',
      });
    }
  },

  async mounted() {
    this.$store.state.BillingSteps.billing_details.cpfOrCnpj = '';
    this.$store.state.BillingSteps.billing_details.name = '';
    this.$store.state.BillingSteps.billing_details.additionalInformation = '';

    this.$store.state.BillingSteps.billing_details.address.city = '';
    this.$store.state.BillingSteps.billing_details.address.country = '';
    this.$store.state.BillingSteps.billing_details.address.state = '';
    this.$store.state.BillingSteps.billing_details.address.line1 = '';
    this.$store.state.BillingSteps.billing_details.address.postal_code = '';

    if (['add-credit-card', 'change-credit-card'].includes(this.flow)) {
      await this.createSetupIntentForAAlreadyCreatedOrg();
    }
  },

  methods: {
    ...mapActions([
      'getOrg',
      'setCurrentOrg',
      'openModal',
      'closeModal',
      'saveOrganizationAdditionalInformation',
    ]),

    previous() {
      if (this.page === 'card') {
        this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/plans`);
      } else if (this.page === 'address') {
        this.$router.push(
          `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
        );
      }
    },

    next() {
      if (this.page === 'card') {
        this.$router.push(
          `/orgs/${this.$route.params.orgUuid}/billing/address?plan=${this.$route.query.plan}`,
        );
      } else if (this.page === 'address') {
        this.confirmCardSetup();
      }
    },

    async changeOrganizationPlan(plan) {
      await orgs.changeOrganizationPlan({
        organizationUuid: this.currentOrg.uuid,
        plan,
      });
    },

    organizationChanged() {
      this.reloadCurrentOrg();
    },

    afterCreateOrg() {
      if (
        this.currentProject.template_type?.startsWith?.('template') &&
        this.currentProject.first_access
      ) {
        this.$router.push({
          name: 'push',
          params: {
            projectUuid: this.currentProject.uuid,
            internal: ['flow', 'editor', this.currentProject.flow_uuid],
          },
        });
      } else {
        this.$router.push({
          name: 'projects',
          params: { orgUuid: this.currentOrg.uuid },
        });
      }
    },

    creditCardChanged() {
      this.reloadCurrentOrg(3);
    },

    sleep(seconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1e3);
      });
    },

    async reloadCurrentOrg(secondsDelay = 0) {
      await this.sleep(secondsDelay);

      try {
        const { data: org } = await this.getOrg({
          uuid: this.$route.params.orgUuid,
        });

        this.setCurrentOrg(org);
      } catch (error) {
        this.$router.push({ name: 'orgs' });
      }
    },

    async onChoosePlan(type) {
      if (type === 'trial') {
        if (this.flow === 'change-plan') {
          this.isSettingUpIntent = true;

          await this.changeOrganizationPlan('trial');

          this.isSettingUpIntent = false;

          this.organizationChanged();

          this.$router.push({
            name: 'billing',
            params: {
              orgUuid: this.currentOrg.uuid,
            },
          });
        } else {
          this.$router.push({
            name: 'create_org',
            query: {
              plan: type,
            },
          });
        }

        return;
      }

      try {
        if (this.hasAlreadyCreditCard) {
          this.isSettingUpIntent = true;

          await this.changeOrganizationPlan(type);

          this.isSettingUpIntent = false;

          this.organizationChanged();

          this.$router.push({
            name: 'billing',
            params: {
              orgUuid: this.currentOrg.uuid,
            },
          });
          /* const changes = [];

          if (this.currentOrg.organization_billing.plan !== 'enterprise') {
            changes.push([this.changePlanToEnterprise]);
          }

          if (this.currentOrg.extra_integration !== this.extraIntegration) {
            changes.push([
              this.saveOrganizationAdditionalInformation,
              {
                organizationUuid: this.currentOrg.uuid,
                extra_integration: this.extraIntegration,
              },
            ]);
          }

          await Promise.all(changes.map(([func, ...args]) => func(...args)));

          if (changes.length) {
            this.organizationChanged();
          }

          this.$router.push(`/orgs/${this.currentOrg.uuid}/billing/success`);
          */
        } else if (this.flow === 'change-plan') {
          await this.createSetupIntentForAAlreadyCreatedOrg();

          this.$router.push(
            `/orgs/${this.currentOrg.uuid}/billing/card?plan=${type}`,
          );
        } else {
          await this.createSetupIntent();

          // this.setupIntent({ organizationUuid }).then((response) => {
          //   this.customer = response?.data?.customer;
          //   this.clientSecret = response?.data?.client_secret;
          // });
          this.$router.push(`/orgs/create/billing/card?plan=${type}`);
        }
      } catch (error) {
        this.openModal({
          type: 'alert',
          data: {
            icon: 'alert-circle-1',
            scheme: 'feedback-yellow',
            title: this.$t('alerts.server_problem.title'),
            description: this.$t('alerts.server_problem.description'),
          },
        });

        setTimeout(() => {
          this.$emit('close');
        });
      }
    },

    async createSetupIntent() {
      this.isSettingUpIntent = true;
      const { data } = await orgs.setupIntent();

      this.$store.state.BillingSteps.billing_details.customer = data.customer;
      this.clientSecret = data.setup_intent.client_secret;
      this.isSettingUpIntent = false;
    },

    async createSetupIntentForAAlreadyCreatedOrg() {
      this.isSettingUpIntent = true;

      orgs
        .setupIntentWithOrg({ organizationUuid: this.$route.params.orgUuid })
        .then((response) => {
          this.$store.state.BillingSteps.billing_details.customer =
            response?.data?.customer;
          this.clientSecret = response?.data?.client_secret;
        })
        .finally(() => {
          this.isSettingUpIntent = false;
        });
    },

    onNextStep() {
      this.current++;
    },

    togglePriceModal() {
      this.isOpenModalPrice = !this.isOpenModalPrice;
    },

    async confirmCardSetup() {
      const stripeConfirmSetupButton = document.querySelector(
        '#stripe-confirm-setup-button',
      );

      stripeConfirmSetupButton.setAttribute('disabled', true);

      let modalVerificationCard = null;

      try {
        const idValue = this.billing_details.cpfOrCnpj.replace(/[^\d]/g, '');

        if (!idValue) {
          throw {
            type: 'cpf_or_cnpj_required',
          };
        }

        if (!this.billing_details.name) {
          throw { type: 'name_required' };
        }

        // await this.saveOrganizationAdditionalInformation({
        //   organizationUuid: this.currentOrg.uuid,
        //   personal_identification_number: idValue,
        //   additional_billing_info: this.billing_details.additionalInformation,
        //   extra_integration: this.extraIntegration,
        // });

        const formCreditCardRefs = this.$refs.formCreditCard.$refs;

        const response =
          await formCreditCardRefs?.elms.instance.confirmCardSetup(
            this.clientSecret,
            {
              payment_method: {
                card: formCreditCardRefs.card.stripeElement,
                billing_details: {
                  name: this.billing_details.name,
                  address: {
                    country: this.billing_details.address.country,
                    state: this.billing_details.address.state,
                    city: this.billing_details.address.city,
                    line1: this.billing_details.address.line1,
                    postal_code: this.billing_details.address.postal_code,
                  },
                },
              },
            },
          );

        if (response.error) {
          throw response.error;
        } else {
          modalVerificationCard = await this.openModal({
            type: 'alert',
            data: {
              persistent: true,
              icon: 'alert-circle-1',
              scheme: 'feedback-yellow',
              title: this.$t('billing.stripe.verification.title'),
              description: this.$t('billing.stripe.verification.description'),
            },
          });

          let plan = this.$route.query.plan;

          if (['add-credit-card', 'change-credit-card'].includes(this.flow)) {
            plan = this.$store.getters.currentOrg?.organization_billing?.plan;
          }

          const { data } = await orgs.setupPlan({
            plan,
            customer: this.$store.state.BillingSteps.billing_details.customer,
          });

          if (data?.status === 'SUCCESS') {
            this.closeModal(modalVerificationCard);

            const modalVerificationValidCard = await this.openModal({
              type: 'alert',
              data: {
                icon: 'check_circle',
                scheme: 'feedback-green',
                title: this.$t('billing.stripe.valid.valid_card.title'),
                description: this.$t(
                  'billing.stripe.valid.valid_card.description',
                ),
              },
            });

            setTimeout(() => {
              this.closeModal(modalVerificationValidCard);
            }, 5000);
          } else {
            this.closeModal(modalVerificationCard);

            this.openModal({
              type: 'alert',
              data: {
                icon: 'alert-circle-1',
                scheme: 'feedback-red',
                title: this.$t(`billing.stripe.errors.invalid_card.title`),
                description: this.$t(
                  `billing.stripe.errors.invalid_card.description`,
                ),
              },
            });

            return;
          }

          if (this.flow === 'create-org') {
            this.$router.push({
              name: 'create_org',
              query: {
                plan: this.$route.query.plan,
              },
            });
          } else if (['change-plan'].includes(this.flow)) {
            await orgs.changeOrganizationPlan({
              organizationUuid: this.currentOrg.uuid,
              plan: this.$route.query.plan,
            });

            this.organizationChanged();

            this.$router.push({
              name: 'billing',
              params: {
                orgUuid: this.currentOrg.uuid,
              },
            });
          } else if (
            ['add-credit-card', 'change-credit-card'].includes(this.flow)
          ) {
            let title = '';
            let description = '';

            if (this.flow === 'add-credit-card') {
              title = this.$t('billing.add_credit_card.success_modal.title');
              description = this.$t(
                'billing.add_credit_card.success_modal.description',
              );
            } else if (this.flow === 'change-credit-card') {
              title = this.$t('billing.change_credit_card.success_modal.title');
              description = this.$t(
                'billing.change_credit_card.success_modal.description',
              );
            }

            this.openModal({
              type: 'alert',
              data: {
                icon: 'check_circle',
                scheme: 'feedback-green',
                title,
                description,
              },
            });

            this.$router.push({
              name: 'billing',
              params: {
                orgUuid: this.$route.params.orgUuid,
              },
            });

            this.organizationChanged();
          }
        }
      } catch (error) {
        if (modalVerificationCard) {
          this.closeModal(modalVerificationCard);
        }

        const errorCode = error?.code;

        if (Object.values(StripeGroupsErrors).flat().includes(errorCode)) {
          const errorKey = Object.keys(StripeGroupsErrors).find((key) =>
            StripeGroupsErrors[key].includes(errorCode),
          );

          this.openModal({
            type: 'alert',
            data: {
              icon: 'alert-circle-1',
              scheme: 'feedback-red',
              title: this.$t(`billing.stripe.errors.groups.${errorKey}.title`),
              description: this.$t(
                `billing.stripe.errors.groups.${errorKey}.description`,
              ),
            },
          });

          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
        } else if (
          Object.keys(enTranslations.billing.stripe.errors).includes(errorCode)
        ) {
          this.openModal({
            type: 'alert',
            data: {
              icon: 'alert-circle-1',
              scheme: 'feedback-red',
              title: this.$t(`billing.stripe.errors.${errorCode}.title`),
              description: this.$t(
                `billing.stripe.errors.${errorCode}.description`,
              ),
            },
          });

          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
        } else if (error?.type === 'validation_error') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
        } else if (error?.type === 'cpf_or_cnpj_required') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
          this.errors.cpfOrCnpj = 'required';
        } else if (error?.type === 'cpf_or_cnpj_invalid') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
          this.errors.cpfOrCnpj = 'cpf_or_cnpj_invalid';
        } else if (error?.type === 'name_required') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
          this.errors.name = 'required';
        } else {
          this.openModal({
            type: 'alert',
            data: {
              icon: 'alert-circle-1',
              scheme: 'feedback-yellow',
              title: this.$t('alerts.server_problem.title'),
              description: this.$t('alerts.server_problem.description'),
            },
          });
        }
      } finally {
        stripeConfirmSetupButton.removeAttribute('disabled');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.billing-form {
  display: flex;
  flex-wrap: wrap-reverse;
  gap: $unnnic-spacing-inline-sm;

  .card-container {
    min-width: 20.75rem;
    flex: 4;
  }

  .form-container {
    min-width: 31.6875rem;
    flex: 6;

    .actions {
      display: flex;
      column-gap: $unnnic-spacing-inline-sm;

      button {
        flex: 1;
      }
    }

    .weni-report {
      margin-top: $unnnic-spacing-stack-sm;
    }
  }
}

.create-org {
  background-color: $unnnic-color-background-sky;

  :deep {
    .StripeElement {
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-sm;
      background-color: $unnnic-color-neutral-snow;
      padding: $unnnic-squish-xs;
      cursor: text;

      & label {
        margin-top: 0;
      }

      &.StripeElement--focus {
        border-color: $unnnic-color-neutral-cleanest;
      }

      &.StripeElement--invalid {
        border-color: $unnnic-color-feedback-red;
      }
    }
  }
}

.plans-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20.75rem, 1fr));
  gap: $unnnic-spacing-inline-sm;
}

.billing-choosed-plan {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 42.625rem;
  margin: 0 auto;

  &__title {
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-regular;
    color: $unnnic-color-neutral-darkest;
    margin-top: $unnnic-spacing-stack-lg;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  &__subtitle {
    color: $unnnic-color-neutral-cloudy;
    text-align: center;
    max-width: 682px;
    margin-bottom: $unnnic-spacing-stack-lg;
  }
}

.create-org :deep(.container .content) {
  flex: initial;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  position: relative;

  .close {
    position: absolute;
    top: $unnnic-spacing-inset-lg;
    right: $unnnic-spacing-inset-lg;
  }
}

.loading-plans {
  display: flex;
  flex-direction: column;
  max-width: 72rem;

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .plans-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20.75rem, 1fr));
    gap: 1rem;
  }
}
</style>
