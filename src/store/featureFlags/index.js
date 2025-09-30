import { defineStore } from 'pinia';
import { computed, inject, watch, ref } from 'vue';
import globalStore from '@/store';
import brainAPI from '@/api/brain';

import { gbKey } from '@/utils/growthbook';

export const useFeatureFlagsStore = defineStore('FeatureFlags', () => {
  const growthbook = inject(gbKey);

  const userEmail = computed(
    () => globalStore?.state?.Account?.profile?.email || '',
  );

  const currentOrgUuid = computed(
    () => globalStore?.state?.Org?.currentOrg?.uuid || '',
  );

  const currentProjectUuid = computed(
    () => globalStore?.state?.Project?.currentProject?.uuid || '',
  );

  const agentsTeam = ref(false);

  const flags = computed(() => ({
    agentsTeam: agentsTeam.value,
    newConnectPlataform: growthbook?.isOn('connect-plataform-1.5'),
    insightsMF: growthbook?.isOn('insights-mf'),
  }));

  async function checkAgentBuilder2(projectUuid) {
    try {
      const response = await brainAPI.customization.getAgentBuilder2({
        projectUuid,
      });
      return response?.data?.multi_agents;
    } catch (error) {
      console.error('Error checking agent builder version:', error);
      return false;
    }
  }

  const isWeniProjectOn = (featureKey, context) => {
    if (!context?.features) return false;

    const feature = context.features[featureKey];

    if (!feature?.rules) return false;

    return feature.rules.some((rule) => {
      const allowedProjects = rule.condition?.weni_project?.$in || [];
      return allowedProjects.includes(context.attributes?.weni_project);
    });
  };

  watch(
    currentOrgUuid,
    (newOrgUuid) => {
      if (newOrgUuid) {
        growthbook.setAttributes({
          ...growthbook.getAttributes(),
          weni_org: newOrgUuid,
        });
      }
    },
    { immediate: true },
  );

  watch(
    currentProjectUuid,
    async (newProjectUuid) => {
      if (newProjectUuid) {
        agentsTeam.value = await checkAgentBuilder2(newProjectUuid);

        growthbook.setAttributes({
          ...growthbook.getAttributes(),
          weni_project: newProjectUuid,
        });
      }
    },
    { immediate: true },
  );

  watch(
    userEmail,
    (newEmail) => {
      if (newEmail) {
        growthbook.setAttributes({
          ...growthbook.getAttributes(),
          email: newEmail,
        });
      }
    },
    { immediate: true },
  );

  return {
    flags,
    agentsTeam,
    instance: growthbook,
    isWeniProjectOn,
  };
});
