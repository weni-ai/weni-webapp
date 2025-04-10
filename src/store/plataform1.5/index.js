import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useFeatureFlagsStore } from '@/store/featureFlags';
import brainAPI from '@/api/brain';
import { PROJECT_COMMERCE } from '@/utils/constants';

export const usePlataform1_5Store = defineStore('plataform1_5', () => {
  const featureFlagsStore = useFeatureFlagsStore();
  
  // State
  const isHumanServiceEnabled = ref(false);
  const isAgentBuilder2 = ref(false);
  const isProjectEnabledAgentBuilder2 = ref(false);
  const isOrgEnabledAgentBuilder2 = ref(false);
  const isEnabledUserNewPlatform = ref(false);

  // Actions
  async function checkHumanService(projectUuid) {
    try {
      const response = await brainAPI.customization.get({ projectUuid });
      if (response?.data?.team) {
        isHumanServiceEnabled.value = response.data.team?.human_support;
      }
    } catch (error) {
      console.error('Error checking human service:', error);
    }
  }

  function initializePlatformState(project) {
    if (!project?.uuid) return;

    const instance = featureFlagsStore.instance;
    const newInstance = { ...instance.context, attributes: { weni_project: project.uuid } };
    const isAgentsTeam = featureFlagsStore.flags.agentsTeam;

    isEnabledUserNewPlatform.value = featureFlagsStore.flags.newConnectPlataform;
    isProjectEnabledAgentBuilder2.value = featureFlagsStore.isWeniProjectOn('agent_builder_2', newInstance);
    isOrgEnabledAgentBuilder2.value = isAgentsTeam;

    if (isProjectEnabledAgentBuilder2.value || isOrgEnabledAgentBuilder2.value) {
      isAgentBuilder2.value = true;
      checkHumanService(project.uuid);
    }
  }

  function shouldDisableSettings(project) {
    if (!isEnabledUserNewPlatform.value) return false;
    
    const isCommerceProject = project?.project_mode === PROJECT_COMMERCE;
    const isAgentBuilder2Enabled = isAgentBuilder2.value;
    const isHumanServiceDisabled = !isHumanServiceEnabled.value;
    
    return isCommerceProject && isAgentBuilder2Enabled && isHumanServiceDisabled;
  }

  function updateIsHumanServiceEnabled(value) {
    isHumanServiceEnabled.value = value;
  }

  return {
    // State
    isHumanServiceEnabled,
    isAgentBuilder2,
    isProjectEnabledAgentBuilder2,
    isOrgEnabledAgentBuilder2,
    isEnabledUserNewPlatform,

    // Actions
    checkHumanService,
    initializePlatformState,
    shouldDisableSettings,
    updateIsHumanServiceEnabled,
  };
});
