<template>
  <section class="weni-update-project-container">
    <section class="weni-update-project">
      <h5 class="weni-update-project__title">
        {{ $t('projects.project_settings.title') }}
      </h5>
      <UnnnicInput
        v-model="name"
        :label="$t('orgs.create.project_name')"
      />
      <section>
        <ProjectDescriptionTextarea v-model="description" />

        <UnnnicFormElement :label="$t('orgs.create.time_zone')">
          <UnnnicSelectSmart
            :modelValue="[
              timezones
                .map(({ toString, zoneName }) => ({
                  value: zoneName,
                  label: toString(),
                }))
                .find(({ value }) => value === timezone),
            ]"
            :options="
              timezones.map(({ toString, zoneName }) => ({
                value: zoneName,
                label: toString(),
              }))
            "
            autocomplete
            autocompleteClearOnFocus
            @update:model-value="timezone = $event[0].value"
          >
          </UnnnicSelectSmart>
        </UnnnicFormElement>
      </section>
      <section
        v-if="isEnableToExtendedMode"
        class="weni-update-project__extended-mode"
      >
        <section class="weni-update-project__extended-mode__description">
          <h5 class="weni-update-project__title">
            {{ $t('projects.project_settings.extended_mode.title') }}
          </h5>
          <p>{{ $t('projects.project_settings.extended_mode.description') }}</p>
          <p>
            <UnnnicIcon
              icon="account_tree"
              size="sm"
              scheme="weni-600"
            />
            {{
              $t('projects.project_settings.extended_mode.conversations_flows')
            }}
          </p>
          <p>
            <UnnnicIcon
              icon="monitoring"
              size="sm"
              scheme="weni-600"
            />
            {{
              $t(
                'projects.project_settings.extended_mode.customized_dashboards',
              )
            }}
          </p>
          <p>
            <UnnnicIcon
              icon="browse"
              size="sm"
              scheme="weni-600"
            />
            {{
              $t('projects.project_settings.extended_mode.integrate_channels')
            }}
          </p>
        </section>

        <UnnnicButton
          class="weni-update-project__button"
          type="secondary"
          :loading="loading"
          @click="modelValue = true"
        >
          {{ $t('projects.project_settings.extended_mode.button') }}
        </UnnnicButton>
      </section>
    </section>

    <section>
      <UnnnicButton
        :disabled="isSaveButtonDisabled"
        class="weni-update-project__button"
        type="primary"
        :loading="loading"
        @click="updateProject"
      >
        {{ $t('orgs.save') }}
      </UnnnicButton>
    </section>
    <UnnnicModalDialog
      v-model="modelValue"
      class="modal-extended-mode"
      type="attention"
      size="sm"
      :showCloseIcon="true"
      :title="$t('projects.project_settings.extended_mode.modal.title')"
      showActionsDivider
      :secondaryButtonProps="{
        text: $t('common.cancel'),
        'data-test': 'cancel-button',
      }"
      :primaryButtonProps="{
        text: $t('common.upgrade'),
        'data-test': 'confirm-button',
        loading: isBtnModalLoading,
      }"
      @secondary-button-click="closeModal"
      @primary-button-click="upgradedProject"
    >
      {{ $t('projects.project_settings.extended_mode.modal.description') }}
    </UnnnicModalDialog>
  </section>
</template>

<script>
import { mapActions } from 'vuex';
import { useFeatureFlagsStore } from '@/store/featureFlags';
import { openAlertModal } from '../../../utils/openServerErrorAlertModal';
import ProjectDescriptionTextarea from '../../../views/projects/form/DescriptionTextarea.vue';
import timezones from './../../../views/projects/timezone';
import ProjectDescriptionChanges from '../../../utils/ProjectDescriptionChanges';
import apiProjects from '../../../api/projects';
import { PROJECT_COMMERCE } from '../../../utils/constants';
import Unnnic from '@weni/unnnic-system';

import {
  ORG_ROLE_MODERATOR,
  ORG_ROLE_ADMIN,
} from '@/components/orgs/orgListItem.vue';
export default {
  name: 'ProjectSettings',

  components: {
    ProjectDescriptionTextarea,
  },
  mixins: [timezones],

  props: {
    projectUuid: String,
    projectName: String,
    projectDescription: String,
    projectTimezone: String,
    authorizations: Array,
    pendingAuthorizations: Array,
    hasChat: Boolean,
  },
  emits: ['updated-project'],

  data() {
    return {
      loading: false,
      name: this.projectName,
      description: this.projectDescription || '',
      timezone: this.projectTimezone,
      modelValue: false,
      isBtnModalLoading: false,
      isUserEnabledExtendedMode: false,
    };
  },

  computed: {
    isSaveButtonDisabled() {
      if (!this.name || !this.description) return true;

      return (
        this.name === this.projectName &&
        this.timezone === this.projectTimezone &&
        this.description === this.projectDescription
      );
    },

    project() {
      return this.$store.state.Project;
    },

    isEnableToExtendedMode() {
      const org = this.$store.getters?.currentOrg;

      const projects = this.$store.state.Project?.projects;

      const project = projects
        ?.flatMap((org) => org.data)
        ?.find((project) => project.uuid === this.projectUuid);

      const isUserAdminOrModerator = [
        ORG_ROLE_MODERATOR,
        ORG_ROLE_ADMIN,
      ].includes(org?.authorization?.role);

      const isCommerceProject = project?.project_mode === PROJECT_COMMERCE;

      return isUserAdminOrModerator && isCommerceProject && this.isUserEnabledExtendedMode;
    },
  },

  methods: {
    ...mapActions(['editProject']),

    async updateProject() {
      try {
        this.loading = true;

        const response = await this.editProject({
          organization: this.$store.getters.currentOrg.uuid,
          projectUuid: this.projectUuid,
          name: this.name,
          description: this.description,
          timezone: this.timezone,
        });

        this.name = response.data.name;
        this.$emit('updated-project', {
          name: this.name,
          description: this.description,
          timezone: this.timezone,
        });

        ProjectDescriptionChanges.register({
          projectUuid: this.projectUuid,
          description: response.data?.description || '',
        });

        openAlertModal({
          type: 'success',
          title: this.$t('orgs.save_success'),
          description: this.$t('projects.save_success_text'),
        });
      } catch (error) {
        openAlertModal({
          type: 'warn',
          description: error?.response?.data?.detail || undefined,
        });
      } finally {
        this.loading = false;
      }
    },

    closeModal() {
      this.modelValue = false;
    },

    openModal() {
      this.modelValue = true;
    },

    async upgradedProject() {
      try {
        this.isBtnModalLoading = true;

        await apiProjects.updateModeProject({
          projectUuid: this.projectUuid,
          projectMode: 'general',
        });

        Unnnic.unnnicCallAlert({
          props: {
            text: this.$t(
              'projects.project_settings.extended_mode.modal.success',
            ),
            icon: 'check_circle',
            scheme: 'feedback-green',
          },
          seconds: 5,
        });
      } catch (error) {
        Unnnic.unnnicCallAlert({
          props: {
            text: this.$t(
              'projects.project_settings.extended_mode.modal.error',
            ),
            type: 'error',
          },
        });
        console.error('upgradeProjectError', error);
      } finally {
        this.isBtnModalLoading = false;
        this.modelValue = false;
      }
    },
  },
  created() {
    const featureFlagsStore = useFeatureFlagsStore();
    this.isUserEnabledExtendedMode = featureFlagsStore.flags.newConnectPlataform;
  }
};
</script>

<style lang="scss" scoped>
.weni-update-project-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.weni-update-project {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: $unnnic-spacing-sm;

  &__title {
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-darkest;
    font-familly: $unnnic-font-family-secondary;
    margin: 0;
  }

  p {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-xs;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    margin: 0;
  }

  &__button {
    width: 100%;
  }

  &__extended-mode {
    display: flex;
    padding: $unnnic-spacing-sm;
    flex-direction: column;
    align-items: flex-start;
    gap: $unnnic-spacing-sm;
    align-self: stretch;

    border-radius: $unnnic-spacing-nano;
    border: 1px solid $unnnic-color-neutral-soft;

    &__description {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: $unnnic-spacing-ant;
      align-self: stretch;
    }
  }
}
</style>
