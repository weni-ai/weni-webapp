import getEnv from '../utils/env.js';
import axios from 'axios';
import {
  attachAuthorizationHeader,
  attachSessionExpirationHandler,
} from './interceptors';

const billingHttp = axios.create({
  baseURL: getEnv('BILLING_API_URL') || '',
});

attachAuthorizationHeader(billingHttp);
attachSessionExpirationHandler(billingHttp);

export default billingHttp;
