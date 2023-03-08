<template>
  <container class="weni-create-project">
    <h1>{{ $t('projects.create.title') }}</h1>
    <h2>{{ $t('projects.create.subtitle') }}</h2>
    <unnnic-input-next
      v-model="projectName"
      :label="$t('orgs.create.project_name')"
      :placeholder="$t('orgs.create.project_name_placeholder')"
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

    <project-format-control v-model="projectFormat" />

    <div class="weni-create-org__group weni-create-org__group__buttons">
      <unnnic-button
        type="terciary"
        :disabled="loadingButton"
        @click="onBack()"
      >
        {{ $t('orgs.create.back') }}
      </unnnic-button>
      <unnnic-button
        :disabled="!canProgress"
        :loading="loadingButton"
        type="secondary"
        @click="onCreateProject()"
      >
        {{ $t('projects.create.create') }}
      </unnnic-button>
    </div>
  </container>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import timezones from './timezone';
import container from './container';
import ProjectFormatControl from './ProjectFormatControl.vue';

export default {
  name: 'ProjectCreate',
  components: {
    container,
    ProjectFormatControl,
  },

  mixins: [timezones],

  data() {
    return {
      projectName: null,
      dateFormat: 'D',
      timeZone: 'America/Argentina/Buenos_Aires',
      loading: false,
      project: null,
      projectFormat: null,
    };
  },
  computed: {
    ...mapState({
      loadingButton: (state) => state.Project.loadingCreateProject,
    }),
    ...mapGetters(['currentOrg', 'currentProject']),

    canProgress() {
      return [this.projectName, this.dateFormat, this.projectFormat].every(
        (field) => field && field.length > 0,
      );
    },
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
      if (
        this.currentProject.project_type?.startsWith?.('template') &&
        this.currentProject.first_access
      ) {
        this.$router.push({
          name: 'push',
          params: {
            projectUuid: uuid,
            internal: ['flow', 'editor', this.currentProject.flow_uuid],
          },
        });
      } else {
        this.$router.push({
          name: 'home',
          params: {
            projectUuid: uuid,
          },
        });
      }
      this.$root.$emit('set-sidebar-expanded');
    },
    async onCreateProject() {
      await this.createProjectForOrg({
        project: {
          name: this.projectName,
          dateFormat: this.dateFormat,
          timeZone: this.timeZone,
          format: this.projectFormat,
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

.weni-create-project {
  h1 {
    text-align: center;
    margin: 0 0 $unnnic-spacing-stack-xs 0;
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-regular;
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-primary;
  }

  h2 {
    text-align: center;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-lg;
    color: $unnnic-color-neutral-cloudy;
    margin: 0 0 $unnnic-spacing-stack-md 0;
    font-family: $unnnic-font-family-primary;
  }

  .unnnic-select ::v-deep .unnnic-form__label {
    margin-top: $unnnic-spacing-stack-md;
  }
}
</style>
