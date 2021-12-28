import axios from 'axios';

export default axios.create({
  baseURL: config.get('ROOT_API'),
});
