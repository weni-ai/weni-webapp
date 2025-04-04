<template>
  <div class="weni-project-list-item">
    <UnnnicCardProject
      :name="name"
      :actionText="$t('projects.join')"
      :statuses="statusList"
      @action="onClick({ name: 'home', params: { projectUuid: project.uuid } })"
    >
      <template #actions>
        <UnnnicDropdownItem
          v-if="isEnabledSettings"
          @click="
            onClick({
              name: 'settingsProject',
              params: { projectUuid: project.uuid, internal: ['init'] },
            })
          "
        >
          <UnnnicIconSvg
            size="sm"
            icon="settings"
          />
          {{ $t('projects.config') }}
        </UnnnicDropdownItem>

        <UnnnicDropdownItem
          v-if="canManageMembers"
          @click="
            $store.dispatch('openRightBar', {
              props: {
                type: 'ProjectManageUsers',
                projectUuid: project.uuid,
                projectName: project.name,
                projectAuthorizations: authorizations.users,
                projectPendingAuthorizations: pendingAuthorizations.users,
                projectHasChat: hasChat,
              },

              events: {
                'added-authorization': addedAuthorization,
                'deleted-authorization': deleteUser,
                'changed-role-authorization': changedRoleAuthorization,
              },
            })
          "
        >
          <UnnnicIconSvg
            size="sm"
            icon="person"
          />
          {{ $t('orgs.manage_members') }}
        </UnnnicDropdownItem>

        <UnnnicDropdownItem
          v-if="canManageMembers"
          @click="openEditProject"
        >
          <UnnnicIconSvg
            size="sm"
            icon="pencil-write-1"
          />
          {{ $t('projects.edit_name') }}
        </UnnnicDropdownItem>

        <UnnnicDropdownItem
          v-else-if="canViewMembers"
          @click="
            $store.dispatch('openRightBar', {
              props: {
                type: 'ProjectReadUsers',
                projectUuid: project.uuid,
                projectName: project.name,
                projectAuthorizations: authorizations.users,
                projectPendingAuthorizations: pendingAuthorizations.users,
                projectHasChat: hasChat,
              },

              events: {
                'deleted-authorization': deleteUser,
              },
            })
          "
        >
          <UnnnicIconSvg
            size="sm"
            icon="person"
          />
          {{ $t('projects.view_members') }}
        </UnnnicDropdownItem>
      </template>
    </UnnnicCardProject>
  </div>
</template>

<script>
import {
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_CONTRIBUTOR,
} from '../users/permissionsObjects';
import { get } from 'lodash';
import { PROJECT_COMMERCE } from '@/utils/constants';
import { useFeatureFlagsStore } from '@/store/featureFlags';
import brainAPI from '@/api/brain';
export default {
  name: 'ProjectListItem',

  components: {},

  props: {
    project: {
      type: Object,
    },
    name: {
      type: String,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },
    aiCount: {
      type: Number,
    },
    contactCount: {
      type: Number,
    },
    flowsCount: {
      type: Number,
    },
    authorizations: {
      type: Object,
    },
    pendingAuthorizations: {
      type: Object,
    },
  },

  data() {
    return {
      isEnabledUserNewPlatform: false,
      isProjectEnabledAgentBuilder2: false,
      isOrgEnabledAgentBuilder2: false,
      isHumanServiceEnabled: false,
      isAgentBuilder2: false,
    };
  },

  computed: {
    canManageMembers() {
      return this.project.authorization.role === PROJECT_ROLE_MODERATOR;
    },

    canViewMembers() {
      return this.project.authorization.role === PROJECT_ROLE_CONTRIBUTOR;
    },

    isEnabledSettings() {
      const isOrgEnabledAgentBuilder2 = this.isOrgEnabledAgentBuilder2;
      const isProjectEnabledAgentBuilder2 = this.isProjectEnabledAgentBuilder2;
      
      // Early return if neither feature is enabled
      if (!isOrgEnabledAgentBuilder2 && !isProjectEnabledAgentBuilder2) {
        return true;
      }
      
      const isCommerceProject = this.project.project_mode === PROJECT_COMMERCE;
      const isAgentBuilder2Enabled = this.isAgentBuilder2;
      const isHumanServiceDisabled = !this.isHumanServiceEnabled;
      
      // Check if all conditions for disabling settings
      const shouldDisableSettings = this.isEnabledUserNewPlatform && 
                                  isCommerceProject && 
                                  isAgentBuilder2Enabled && 
                                  isHumanServiceDisabled;
      
      return !shouldDisableSettings;
    },

    hasChat() {
      return false;
    },

    statusList() {
      return [
        {
          title: this.$t('projects.ai'),
          icon: 'neurology',
          scheme: 'aux-blue',
          count: this.aiCount,
        },
        {
          title: this.$t('projects.flows'),
          icon: 'account_tree',
          scheme: 'aux-purple',
          count: this.flowsCount,
        },
        {
          title: this.$t('projects.contacts'),
          icon: 'person',
          scheme: 'aux-lemon',
          count: this.contactCount,
        },
      ];
    },
  },

  watch: {
    'project.uuid': {
      immediate: true,
      handler() {
        if (
          get(this.$route, 'query.edit_project_uuid') === this.project.uuid &&
          !window.alreadyOpenedEditProject
        ) {
          window.alreadyOpenedEditProject = true;
          this.openEditProject();
        }
      },
    },
  },

  methods: {
    openEditProject() {
      if (!this.canManageMembers) {
        return;
      }

      this.$store.dispatch('openRightBar', {
        props: {
          type: 'ProjectSettings',
          projectUuid: this.project.uuid,
          projectName: this.project.name,
          projectDescription: this.project.description,
          projectTimezone: this.project.timezone,
          projectAuthorizations: this.authorizations.users,
          projectPendingAuthorizations: this.pendingAuthorizations.users,
          projectHasChat: this.hasChat,
        },

        events: {
          'added-authorization': this.addedAuthorization,
          'deleted-authorization': this.deleteUser,
          'changed-role-authorization': this.changedRoleAuthorization,
          'updated-project': this.updatedProject,
        },
      });
    },

    addedAuthorization($event) {
      this.$emit('added-authorization', $event);
    },

    onClick(route) {
      this.$emit('click', route);
    },

    async deleteUser(userEmail) {
      this.$emit('deleted-authorization', userEmail);
    },

    changedRoleAuthorization($event) {
      this.$emit('changed-role-authorization', $event);
    },
    updatedProject($event) {
      this.$emit('updated-project', $event);
    },

    async checkHumanService() {
      const response = await brainAPI.customization.get({ projectUuid: this.project.uuid });
      if(response?.data?.team) {
        this.isHumanServiceEnabled = response.data.team?.human_support;
       }
    }
  },
  async created() {
    if(this.project.uuid) {
      const featureFlagsStore = useFeatureFlagsStore();

      const instance = featureFlagsStore.instance;
      const newInstance = { ...instance.context, attributes: { weni_project: this.project.uuid } };
      const isAgentsTeam = featureFlagsStore.flags.agentsTeam;

      const isEnabledProject = featureFlagsStore.isWeniProjectOn('agent_builder_2', newInstance)

      this.isEnabledUserNewPlatform = featureFlagsStore.flags.newConnectPlataform;
      this.isProjectEnabledAgentBuilder2 = isEnabledProject;
      this.isOrgEnabledAgentBuilder2 = isAgentsTeam;


      if(isEnabledProject || isAgentsTeam) {
        this.isAgentBuilder2 = true;
        this.checkHumanService();
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.weni-project-list-item {
  border-radius: $unnnic-border-radius-md;
}

:deep(.unnnic-card-project .header .buttons .unnnic-dropdown) {
  user-select: none;

  .unnnic-dropdown__content {
    align-items: flex-start;

    > a {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      min-width: max-content;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      width: 100%;

      & + a {
        margin-top: $unnnic-spacing-stack-sm;
      }

      > .unnnic-icon {
        margin-right: $unnnic-spacing-inline-xs;
        margin-left: 0;
      }
    }
  }
}

:deep(.unnnic-dropdown-item + .unnnic-dropdown-item:before) {
  content: none;
}
</style>
