import { defineStore } from 'pinia';
import { computed, inject, watch } from 'vue';
import globalStore from '@/store';

import { gbKey } from '@/utils/growthbook';

export const useFeatureFlagsStore = defineStore('FeatureFlags', () => {
  const growthbook = inject(gbKey);

  const flags = computed(() => ({
    agentsTeam: growthbook?.isOn('agent_builder_2'),
    newConnectPlataform: growthbook?.isOn('connect-plataform-1.5'),
    insightsMF: growthbook?.isOn('insights-mf'),
  }));

  const userEmail = computed(
    () => globalStore?.state?.Account?.profile?.email || '',
  );

  const currentOrgUuid = computed(
    () => globalStore?.state?.Org?.currentOrg?.uuid || '',
  );

  const currentProjectUuid = computed(
    () => globalStore?.state?.Project?.currentProject?.uuid || '',
  );

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
    (newProjectUuid) => {
      if (newProjectUuid) {
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
    instance: growthbook,
    isWeniProjectOn,
  };
});
