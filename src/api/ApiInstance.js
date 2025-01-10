import axios from 'axios';
import getEnv from '../utils/env';

export default axios.create({
  baseURL: getEnv('ROOT_API'),
});
