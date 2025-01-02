<template>
  <section class="weni-update-project-container">
  <section class="weni-update-project">
    <h5 class="weni-update-project__title">{{ $t('projects.title') }}</h5>
    <UnnnicInput
      v-model="name"
      :label="$t('orgs.create.project_name')"
    />
    <section>
      <ProjectDescriptionTextarea
        v-model="description"
      />

      <UnnnicFormElement
        :label="$t('orgs.create.time_zone')"
      >
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
    <section class="weni-update-project__extended-mode">
      <section class="weni-update-project__extended-mode__description">
        <h5 class="weni-update-project__title">{{ $t('projects.extended_mode.title') }}</h5>
        <p>{{ $t('projects.extended_mode.description') }}</p>
        <p> 
          <UnnnicIcon 
            icon="account_tree"
            size="sm"
            scheme="weni-600"
          />
          {{ $t('projects.extended_mode.conversations_flows') }}
        </p>
        <p> 
          <UnnnicIcon 
            icon="monitoring"
            size="sm"
            scheme="weni-600"
          />
          {{ $t('projects.extended_mode.customized_dashboards') }}
        </p>
        <p> 
          <UnnnicIcon 
            icon="browse"
            size="sm"
            scheme="weni-600"
          />
          {{ $t('projects.extended_mode.integrate_channels') }}
        </p>
      </section>

      <UnnnicButton
        class="weni-update-project__button"
        type="secondary"
        :loading="loading"
      >
        {{ $t('projects.extended_mode.button') }}
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
</section>
</template>

<script>
import { mapActions } from 'vuex';
import { openAlertModal } from '../../../utils/openServerErrorAlertModal';
import ProjectDescriptionTextarea from '../../../views/projects/form/DescriptionTextarea.vue';
import timezones from './../../../views/projects/timezone';
import ProjectDescriptionChanges from '../../../utils/ProjectDescriptionChanges';

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

  data() {
    return {
      loading: false,
      name: this.projectName,
      description: this.projectDescription || '',
      timezone: this.projectTimezone,
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
  },
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
