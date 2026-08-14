import { ref } from 'vue';
import { defineStore } from 'pinia';
import dashboard from '@/api/dashboard';

export const useDashboardStore = defineStore('dashboard', () => {
  const currentLanguage = ref('en');

  function getStatus({ orgId, projectUuid }) {
    return dashboard.status(orgId, projectUuid);
  }

  // eslint-disable-next-line no-unused-vars
  function getNewsletterList({ orgId, projectUuid, page = 1, limit = 10 }) {
    const offset = limit * (page - 1);
    return dashboard.newsletterList(orgId, offset, limit);
  }

  function newsletter({ orgId, id }) {
    return dashboard.newsletter(orgId, id);
  }

  return {
    currentLanguage,
    getStatus,
    getNewsletterList,
    newsletter,
  };
});
