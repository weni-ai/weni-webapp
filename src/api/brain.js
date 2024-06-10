import axios from 'axios';
import keycloak from '../services/Keycloak';
import getEnv from '../utils/env';

const nexus = axios.create({
  baseURL: getEnv('NEXUS_API'),
});

nexus.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${keycloak?.keycloak?.token}`;
  return config;
});

export default {
  edit({ projectUuid, brainOn }) {
    return nexus.patch(`api/${projectUuid}/project`, {
      brain_on: brainOn,
    });
  },

  contentBase: {
    get({ projectUuid }) {
      return nexus.get(`api/${projectUuid}/router/`);
    },
  },

  customization: {
    edit({ projectUuid, name, goal }) {
      return nexus.put(`api/${projectUuid}/customization/`, {
        agent: {
          name,
          role: 'Atendente',
          goal,
          personality: 'Amigável',
        },
        instructions: [],
      });
    },
  },

  content: {
    texts: {
      create({ contentBaseUuid, text }) {
        return nexus.post(`api/${contentBaseUuid}/content-bases-text/`, {
          text,
        });
      },
    },

    sites: {
      create({ contentBaseUuid, link }) {
        return nexus.post(`api/${contentBaseUuid}/content-bases-link/`, {
          link,
        });
      },
    },

    files: {
      create({ contentBaseUuid, file }) {
        const form = new FormData();

        const indexOfLastDot = file.name.lastIndexOf('.');

        const fileName = file.name.slice(0, indexOfLastDot).replace(/\./g, ' ');
        const extensionFile = file.name.slice(fileName.length + 1);

        console.log('name', fileName, file);

        form.append('file', file, fileName);
        form.append('extension_file', extensionFile);
        form.append('load_type', 'pdfminer');

        return nexus.post(`api/${contentBaseUuid}/content-bases-file/`, form);
      },
    },
  },
};
