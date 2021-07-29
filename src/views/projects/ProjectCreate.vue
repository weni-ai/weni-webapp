<template>
  <container class="weni-create-project">
    <h1>{{ $t('projects.create.title') }}</h1>
    <h2>{{ $t('projects.create.subtitle') }}</h2>
    <unnnic-input
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

    <div class="weni-create-org__group weni-create-org__group__buttons">
      <unnnic-button type="terciary" :disabled="loading" @click="onBack()">
        {{ $t('orgs.create.back') }}
      </unnnic-button>
      <unnnic-button
        :disabled="!canProgress"
        :loading="loading"
        type="secondary"
        @click="onCreateProject()"
      >
        {{ $t('projects.create.create') }}
      </unnnic-button>
    </div>

    <modal
      type="confirm"
      v-model="isCreatedProjectSuccessfullyConfirmModalOpen"
      :data="createdProjectSuccessfullyConfirmModalData"
    />
  </container>
</template>

<script>
import {
  unnnicInput,
  unnnicButton,
  unnnicSelect,
  unnnicCallAlert,
} from '@weni/unnnic-system';
import Modal from '../../components/external/Modal.vue';
import { mapActions, mapGetters } from 'vuex';
import timezones from './timezone';
import container from './container';

export default {
  name: 'ProjectCreate',
  components: {
    unnnicInput,
    unnnicButton,
    unnnicSelect,
    container,
    Modal,
  },

  mixins: [timezones],

  data() {
    return {
      projectName: null,
      dateFormat: 'D',
      timeZone: 'America/Argentina/Buenos_Aires',
      loading: false,
      project: null,

      isCreatedProjectSuccessfullyConfirmModalOpen: false,
      createdProjectSuccessfullyConfirmModalData: {},
    };
  },
  computed: {
    ...mapGetters(['currentOrg']),

    canProgress() {
      return [this.projectName, this.dateFormat].every(
        (field) => field && field.length > 0,
      );
    },
  },
  methods: {
    ...mapActions(['createProject', 'setCurrentProject']),

    onBack() {
      this.$router.push('/projects/list');
    },
    onAccess() {
      if (this.project) {
        const projectObject = {
          uuid: this.project.uuid,
          organization: {
            uuid: this.currentOrg.uuid,
          },
          name: this.project.name,
          flow_organization: {
            uuid: this.project.flow_organization,
          },
          menu: this.project.menu,
        };

        this.setCurrentProject(projectObject);

        this.$router.push('/home');
        this.$root.$emit('set-sidebar-expanded');
      }
    },
    async onCreateProject() {
      this.loading = true;
      try {
        const response = await this.createProject({
          orgId: this.currentOrg.uuid,
          name: this.projectName,
          dateFormat: this.dateFormat,
          timezone: this.timeZone,
        });
        this.project = response.data;

        this.isCreatedProjectSuccessfullyConfirmModalOpen = true;

        this.createdProjectSuccessfullyConfirmModalData = {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('projects.create.confirm_title'),
          description: this.$t('projects.create.confirm_subtitle'),
          cancelText: this.$t('projects.create.view_projects'),
          confirmText: this.$t('projects.create.go_to_project'),
          onClose: this.onBack,
          onConfirm: (justClose) => {
            justClose();
            this.onAccess();
          },
        };
      } catch (e) {
        unnnicCallAlert({
          props: {
            text: this.$t('orgs.create.org_error'),
            title: 'Error',
            icon: 'check-circle-1-1',
            scheme: 'feedback-red',
            position: 'bottom-right',
            closeText: this.$t('close'),
          },
          seconds: 3,
        });
      } finally {
        this.loading = false;
      }
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
}
</style>
