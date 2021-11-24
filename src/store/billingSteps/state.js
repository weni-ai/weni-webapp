export default {
  current: 0,
  currentModal: 0,
  loading: false,
  integrations: '0',
  org: {
    name: null,
    description: null,
  },
  orgError: null,
  project: {
    name: null,
    dateFormat: 'D',
    timeZone: 'America/Argentina/Buenos_Aires',
  },
  projectError: null,
  users: [],
  userChanges: {},
  billing_details: {
    address: {
      city: '',
      country: '',
      line1: '',
      line2: null,
      postal_code: '',
      state: '',
    },
    email: null,
    name: null,
    phone: null,
  },
};
