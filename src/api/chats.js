import axios from 'axios';
import getEnv from '../utils/env';
import keycloak from '../services/Keycloak';
import project from '../store/project';

const chatsHttp = axios.create({
  baseURL: getEnv('VITE_CHATS_API_URL'),
});

chatsHttp.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${keycloak?.keycloak?.token}`;
  return config;
});

export default {
  async listAllSectors() {
    const endpoint = '/sector/';

    const params = { project: project.state.currentProject.uuid, limit: 9999 };

    const response = await chatsHttp.get(endpoint, { params });

    return response.data;
  },
};
