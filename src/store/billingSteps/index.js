import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useBillingStepsStore = defineStore('BillingSteps', () => {
  const current = ref(0);
  const currentModal = ref(0);
  const loading = ref(false);
  const isActiveNewWhatsappIntegrations = ref(false);
  const integrations = ref('1');
  const flow = ref('');
  const org = ref({
    name: '',
    description: '',
  });
  const orgError = ref(null);
  const project = ref({
    name: null,
    dateFormat: 'D',
    timeZone: 'America/Argentina/Buenos_Aires',
    format: null,
    globals: {},
  });
  const projectError = ref(null);
  const users = ref([]);
  const billing_details = reactive({
    customer: '',
    address: {
      city: '',
      country: '',
      line1: '',
      line2: null,
      postal_code: '',
      state: '',
    },
    email: null,
    name: '',
    phone: null,
    cpfOrCnpj: '',
    additionalInformation: '',
  });
  const pricing = reactive({
    status: null,
    plans: {},
  });

  function BILLING_ORG_STEP(nextOrg) {
    if (current.value === 0 && nextOrg && nextOrg.name && nextOrg.description) {
      org.value = nextOrg;
      current.value = current.value + 1;
    }
  }

  function BILLING_MEMBERS_STEP({ users: nextUsers }) {
    users.value = nextUsers;
    if (current.value === 1) current.value = current.value + 1;
  }

  function BILLING_PROJECT_STEP(nextProject) {
    if (
      current.value === 2 &&
      nextProject &&
      nextProject.name &&
      nextProject.dateFormat &&
      nextProject.timeZone &&
      nextProject.format
    ) {
      project.value = {
        name: nextProject.name,
        description: nextProject.description,
        dateFormat: nextProject.dateFormat,
        timeZone: nextProject.timeZone,
        format: nextProject.format,
        globals: nextProject.globals,
      };
    }
  }

  function BILLING_BACK() {
    if (current.value !== 0) current.value = current.value - 1;
  }

  function BILLING_FINISH_STEPS() {
    currentModal.value = 'success';
  }

  function BILLING_STEP_ORG(step) {
    current.value = step;
  }

  function BILLING_STEP(step) {
    currentModal.value = step;
  }

  function BILLING_NEXT_STEPS() {
    currentModal.value++;
  }

  function BILLING_UPDATE_INTEGRATION({ type, payload }) {
    switch (type) {
      case 'add':
        if (integrations.value >= 1 && integrations.value < 10)
          integrations.value = String(Number(integrations.value) + 1);

        break;

      case 'subtract':
        if (integrations.value > 1 && integrations.value <= 10)
          integrations.value = String(Number(integrations.value) - 1);

        break;

      case 'update':
        integrations.value = payload;
        break;

      default:
        break;
    }
  }

  function SET_WHATSAPP_INTEGRATIONS_ACTIVE(isActive) {
    isActiveNewWhatsappIntegrations.value = isActive;
  }

  function SET_INTEGRATIONS_COUNT(count) {
    integrations.value = String(count);
  }

  function SET_PRICING_STATUS(status) {
    pricing.status = status;
  }

  function SET_PRICING_PLANS(plans) {
    pricing.plans = plans;
  }

  function SET_BILLING_CPF_CNPJ(value) {
    billing_details.cpfOrCnpj = value;
  }

  function SET_BILLING_NAME(value) {
    billing_details.name = value;
  }

  function SET_BILLING_ADDITIONAL_INFO(value) {
    billing_details.additionalInformation = value;
  }

  function SET_BILLING_CUSTOMER(value) {
    billing_details.customer = value;
  }

  function SET_BILLING_ADDRESS({ field, value }) {
    billing_details.address[field] = value;
  }

  function RESET_BILLING_DETAILS() {
    billing_details.cpfOrCnpj = '';
    billing_details.name = '';
    billing_details.additionalInformation = '';
    billing_details.address.city = '';
    billing_details.address.country = '';
    billing_details.address.state = '';
    billing_details.address.line1 = '';
    billing_details.address.postal_code = '';
  }

  function setBillingOrgStep(nextOrg) {
    BILLING_ORG_STEP(nextOrg);
  }

  function setBillingMembersStep({ users: nextUsers }) {
    BILLING_MEMBERS_STEP({ users: nextUsers });
  }

  function setBillingProjectStep(nextProject) {
    BILLING_PROJECT_STEP(nextProject);
  }

  function backBilling() {
    BILLING_BACK();
  }

  function finishBillingSteps() {
    BILLING_FINISH_STEPS();
  }

  function resetBillingSteps() {
    BILLING_STEP_ORG(0);
    BILLING_STEP('plans');
  }

  function setBillingStep(step) {
    BILLING_STEP(step);
  }

  function nextBillingStep() {
    BILLING_NEXT_STEPS();
  }

  function addIntegration() {
    BILLING_UPDATE_INTEGRATION({ type: 'add' });
  }

  function removeIntegration() {
    BILLING_UPDATE_INTEGRATION({ type: 'subtract' });
  }

  function updateIntegration(payload) {
    BILLING_UPDATE_INTEGRATION({ type: 'update', payload });
  }

  function setWhatsappIntegrationsActive(isActive) {
    SET_WHATSAPP_INTEGRATIONS_ACTIVE(isActive);
  }

  function setIntegrationsCount(count) {
    SET_INTEGRATIONS_COUNT(count);
  }

  function setPricingStatus(status) {
    SET_PRICING_STATUS(status);
  }

  function setPricingPlans(plans) {
    SET_PRICING_PLANS(plans);
  }

  function fetchPricingPlans(orgApi) {
    setPricingStatus('loading');

    return orgApi.plansPricing().then(({ data }) => {
      setPricingStatus('loaded');
      setPricingPlans(data.plans);
    });
  }

  function setBillingCpfCnpj(value) {
    SET_BILLING_CPF_CNPJ(value);
  }

  function setBillingName(value) {
    SET_BILLING_NAME(value);
  }

  function setBillingAdditionalInfo(value) {
    SET_BILLING_ADDITIONAL_INFO(value);
  }

  function setBillingCustomer(value) {
    SET_BILLING_CUSTOMER(value);
  }

  function setBillingAddress({ field, value }) {
    SET_BILLING_ADDRESS({ field, value });
  }

  function resetBillingDetails() {
    RESET_BILLING_DETAILS();
  }

  function setupIntentWithOrg({ orgApi, orgUuid }) {
    return orgApi
      .setupIntentWithOrg({ organizationUuid: orgUuid })
      .then((response) => {
        setBillingCustomer(response?.data?.customer);
        return response?.data?.client_secret;
      });
  }

  return {
    current,
    currentModal,
    loading,
    isActiveNewWhatsappIntegrations,
    integrations,
    flow,
    org,
    orgError,
    project,
    projectError,
    users,
    billing_details,
    pricing,
    BILLING_ORG_STEP,
    BILLING_MEMBERS_STEP,
    BILLING_PROJECT_STEP,
    BILLING_BACK,
    BILLING_FINISH_STEPS,
    BILLING_STEP_ORG,
    BILLING_STEP,
    BILLING_NEXT_STEPS,
    BILLING_UPDATE_INTEGRATION,
    SET_WHATSAPP_INTEGRATIONS_ACTIVE,
    SET_INTEGRATIONS_COUNT,
    SET_PRICING_STATUS,
    SET_PRICING_PLANS,
    SET_BILLING_CPF_CNPJ,
    SET_BILLING_NAME,
    SET_BILLING_ADDITIONAL_INFO,
    SET_BILLING_CUSTOMER,
    SET_BILLING_ADDRESS,
    RESET_BILLING_DETAILS,
    setBillingOrgStep,
    setBillingMembersStep,
    setBillingProjectStep,
    backBilling,
    finishBillingSteps,
    resetBillingSteps,
    setBillingStep,
    nextBillingStep,
    addIntegration,
    removeIntegration,
    updateIntegration,
    setWhatsappIntegrationsActive,
    setIntegrationsCount,
    setPricingStatus,
    setPricingPlans,
    fetchPricingPlans,
    setBillingCpfCnpj,
    setBillingName,
    setBillingAdditionalInfo,
    setBillingCustomer,
    setBillingAddress,
    resetBillingDetails,
    setupIntentWithOrg,
  };
});
