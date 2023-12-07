<template>
  <container-condensed>
    <header>
      <h6 class="u color-neutral-darkest">
        {{ $t('projects.create.title') }}
      </h6>

      <div class="u font secondary body-lg color-neutral-cloudy">
        {{ $t('projects.create.subtitle') }}
      </div>
    </header>

    <unnnic-input-next
      :value="projectName"
      @input="
        projectName = $event;
        errors.projectName = false;
      "
      :label="$t('orgs.create.project_name')"
      :placeholder="$t('orgs.create.project_name_placeholder')"
      :error="errors.projectName"
      ref="projectName"
    />

    <description-textarea
      ref="projectDescription"
      class="mt-sm"
      :value="projectDescription"
      :error="errors.projectDescription"
      @input="
        projectDescription = $event;
        errors.projectDescription = false;
      "
    />

    <unnnic-select v-model="dateFormat" :label="$t('orgs.create.date_format')">
      <option value="D">DD-MM-YYYY</option>
      <option value="M">MM-DD-YYYY</option>
    </unnnic-select>

    <unnnic-select
      v-model="timeZone"
      :label="$t('orgs.create.time_zone')"
      search
      :search-placeholder="$t('orgs.create.timezone_search_placeholder')"
    >
      <option
        v-for="timezone in timezones"
        :key="timezone.zoneName"
        :value="timezone.zoneName"
      >
        {{ timezone }}
      </option>
    </unnnic-select>

    <project-format-control
      :type="projectFormat"
      @change="
        projectFormat = $event;
        errors.projectFormat = false;
      "
      :setup.sync="setupFields"
      :error="errors.projectFormat"
      ref="projectFormat"
    />

    <div class="weni-create-org__group weni-create-org__group__buttons">
      <unnnic-button
        type="tertiary"
        :disabled="loadingButton"
        @click="onBack()"
      >
        {{ $t('orgs.create.back') }}
      </unnnic-button>
      <unnnic-button
        :loading="loadingButton"
        type="secondary"
        @click="onCreateProject()"
      >
        {{ $t('projects.create.create') }}
      </unnnic-button>
    </div>
  </container-condensed>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import timezones from './timezone';
import ProjectFormatControl from './ProjectFormatControl.vue';
import ContainerCondensed from '../../components/ContainerCondensed.vue';
import DescriptionTextarea from './form/DescriptionTextarea.vue';

export default {
  name: 'ProjectCreate',
  components: {
    ContainerCondensed,
    ProjectFormatControl,
    DescriptionTextarea,
  },

  mixins: [timezones],

  data() {
    return {
      projectName: null,
      projectDescription: '',
      dateFormat: 'D',
      timeZone: 'America/Argentina/Buenos_Aires',
      loading: false,
      project: null,
      projectFormat: null,
      setupFields: {},
      errors: {
        projectName: false,
        projectDescription: false,
        projectFormat: false,
      },
    };
  },
  computed: {
    ...mapState({
      loadingButton: (state) => state.Project.loadingCreateProject,
    }),
    ...mapGetters(['currentOrg', 'currentProject']),
  },
  methods: {
    ...mapActions(['createProjectForOrg', 'setCurrentProject', 'openModal']),

    onBack() {
      this.$router.push({
        name: 'projects',
        params: {
          orgUuid: this.currentOrg.uuid,
        },
      });
    },
    onAccess(uuid) {
      this.$router.push({
        name: 'home',
        params: {
          projectUuid: uuid,
        },
      });
      this.$root.$emit('set-sidebar-expanded');
    },
    async onCreateProject() {
      const canFinish = [
        this.projectName,
        this.projectDescription,
        this.dateFormat,
        this.timeZone,
        this.projectFormat,
      ].every((field) => field && field.length > 0);

      if (!canFinish) {
        ['projectFormat', 'projectDescription', 'projectName'].forEach(
          (fieldName) => {
            if (!this[fieldName]) {
              console.log('find', fieldName, this.$refs[fieldName]);
              this.$refs[fieldName].$el.scrollIntoView({
                behavior: 'smooth',
                inline: 'nearest',
              });
              this.errors[fieldName] = this.$t('errors.required');
            }
          },
        );

        return;
      }

      await this.createProjectForOrg({
        project: {
          name: this.projectName,
          description: this.projectDescription,
          dateFormat: this.dateFormat,
          timeZone: this.timeZone,
          format: this.projectFormat,
          globals: this.setupFields,
        },
        onBack: this.onBack,
        onAccess: this.onAccess,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.mt-sm {
  margin-top: $unnnic-spacing-sm;
}

header {
  text-align: center;
  margin-bottom: $unnnic-spacing-stack-md;
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-stack-xs;
}

.unnnic-select ::v-deep .unnnic-form__label {
  margin-top: $unnnic-spacing-stack-md;
}
</style>
