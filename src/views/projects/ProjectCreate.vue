<template>
  <div class="unnnic-grid-lg">
    <div class="weni-create-project unnnic-grid-span-12">
      <h1> {{ $t('projects.create.title') }} </h1>
      <h2> {{ $t('projects.create.subtitle') }} </h2>
      <unnnic-input
        v-model="projectName"
        :label="$t('orgs.create.project_name')"
        :placeholder="$t('orgs.create.project_name_placeholder')"/>
      <unnnic-select
        v-model="dateFormat"
        :label="$t('orgs.create.date_format')">
          <option value="D"> DD-MM-YYYY </option>
          <option value="M"> MM-DD-YYYY </option>
      </unnnic-select>
      <!-- <unnnic-select :label="$t('orgs.create.time_zone')" /> -->
      <div class="weni-create-org__group weni-create-org__group__buttons">
        <unnnic-button
          type="terciary"
          :disabled="loading"
          @click="onBack()">
          {{ $t('orgs.create.back') }}
        </unnnic-button>
        <unnnic-button
          :disabled="!canProgress || loading"
          type="secondary"
          @click="onCreateProject()"> {{ $t('projects.create.create') }} </unnnic-button>
      </div>
      <confirm-modal
        :open="confirm"
        icon="check-circle-1-1"
        :title="$t('projects.create.confirm_title')"
        :description="$t('projects.create.confirm_subtitle')"
        :confirmText="$t('projects.create.go_to_project')"
        :cancelText="$t('cancel')"
        @close="confirm = onBack()"
        @confirm="confirmPermissions = false; onAccess();"
      />
    </div>
  </div>
</template>

<script>
import ConfirmModal from '../../components/ConfirmModal';
import {
  unnnicInput,
  unnnicButton,
  unnnicSelect,
  unnnicCallAlert,
} from '@weni/unnnic-system';
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'ProjectCreate',
  components: {  
    unnnicInput,
    unnnicButton,
    unnnicSelect,
    ConfirmModal,
  },
  data() {
    return {
      projectName: null,
      dateFormat: null,
      loading: false,
      confirm: false,
      project: null,
    };
  },
  computed: {
    ...mapGetters(['getCurrentOrgId']),
    canProgress() {
      return [this.projectName, this.dateFormat].every((field) => field && field.length > 0);
    },
  },
  methods: {
    ...mapActions(['createProject', 'setCurrentProject']),
    onBack() {
      this.luigiClient.linkManager().navigate('/projects/list');
    },
    onAccess() {
      if (this.project) this.setCurrentProject({ org: this.getCurrentOrgId(), project: this.project.uuid, projectName: this.project.name });
      this.luigiClient.sendCustomMessage({ id: 'change-org' });
      this.luigiClient.linkManager().navigate('/projects/list');
    },
    async onCreateProject() {
      this.loading = true;
      try {
        const response = await this.createProject({
          orgId: this.getCurrentOrgId(),
          name: this.projectName,
          dateFormat: this.dateFormat,
        });
        this.project = response.data;
        this.confirm = true;
      } catch (e) {
        unnnicCallAlert({ props: {
          text: this.$t('orgs.create.org_error'),
          title: 'Error',
          icon: 'check-circle-1-1',
          scheme: 'feedback-red',
          position: 'bottom-right',
          closeText: this.$t('close'),
        }, seconds: 3 });
      } finally {
        this.loading = false;
      }
    }
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