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

  read({ projectUuid }) {
    return nexus.get(`api/${projectUuid}/project`);
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
    get({ projectUuid }) {
      return nexus.get(`api/${projectUuid}/customization/`);
    },
    getAgentBuilder2({ projectUuid }) {
      return nexus.get(`api/project/${projectUuid}/multi-agents`);
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

        form.append('file', file, `${fileName}.${extensionFile}`);
        form.append('extension_file', extensionFile);
        form.append('load_type', 'pdfminer');

        return nexus.post(`api/${contentBaseUuid}/content-bases-file/`, form);
      },
    },
  },
};
