import { defineStore } from 'pinia';
import { getGrowthBook } from '@/utils/growthbook';

// TODO: Trying to set growthbook instance in store but not working this solution use inject in app.vue
export const useFeatureFlagsStore = defineStore('FeatureFlags', {
    state: () => ({
        newConnectPlataform: false,
        agentsTeams: false,
        isInitialized: false
    }),
    actions: {
        initialize() {
            const gb = getGrowthBook();
            console.log('APP - initialize -inject =========>', gb);
            if (gb) {
                this.setNewConnectPlataform(gb.isOn('connect-plataform-1.5'));
                this.setAgentsTeams(gb.isOn('agents-teams'));
                this.isInitialized = true;
            }
        },
        setNewConnectPlataform(value) {
            this.newConnectPlataform = value;
        },
        setAgentsTeams(value) {
            this.agentsTeams = value;
        }
    }
});