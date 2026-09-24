import axios from 'axios';
import getEnv from '../utils/env';
import { useProjectStore } from '@/store/project';
import { attachAuthorizationHeader } from './interceptors';

const chatsHttp = axios.create({
  baseURL: getEnv('CHATS_API_URL'),
});

attachAuthorizationHeader(chatsHttp);

export default {
  async getProjectInfo(projectUuid) {
    const endpoint = `/project/${projectUuid}/`;

    const response = await chatsHttp.get(endpoint);

    return response.data;
  },
  async listAllSectors() {
    const endpoint = '/sector/';

    const params = {
      project: useProjectStore().currentProject.uuid,
      limit: 9999,
    };

    const response = await chatsHttp.get(endpoint, { params });

    return response.data;
  },
};
