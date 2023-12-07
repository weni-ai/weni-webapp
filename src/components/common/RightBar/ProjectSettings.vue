<template>
  <div>
    <h2 class="weni-update-project__title">{{ $t('orgs.change_name') }}</h2>
    <p class="weni-update-project__description">
      {{ $t('projects.edit_name_description') }}
    </p>

    <div class="weni-update-project">
      <unnnic-input :label="$t('orgs.create.project_name')" v-model="name" />

      <project-description-textarea class="mt-sm" v-model="description" />

      <unnnic-button
        :disabled="isSaveButtonDisabled"
        class="weni-update-project__button"
        type="secondary"
        :loading="loading"
        @click="updateProject"
      >
        {{ $t('orgs.save') }}
      </unnnic-button>
    </div>

    <div class="weni-update-project__separator"></div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { openAlertModal } from '../../../utils/openServerErrorAlertModal';
import ProjectDescriptionTextarea from '../../../views/projects/form/DescriptionTextarea.vue';

export default {
  name: 'ProjectSettings',

  components: {
    ProjectDescriptionTextarea,
  },

  props: {
    projectUuid: String,
    projectName: String,
    projectDescription: String,
    authorizations: Array,
    pendingAuthorizations: Array,
    hasChat: Boolean,
  },

  data() {
    return {
      loading: false,
      name: this.projectName,
      description: this.projectDescription,
    };
  },

  computed: {
    isSaveButtonDisabled() {
      if (!this.name || !this.description) return true;

      return (
        this.name === this.projectName &&
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
        });

        this.name = response.data.name;
        this.$emit('updated-project', this.name);

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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.mt-sm {
  margin-top: $unnnic-spacing-sm;
}

.weni-update-project {
  margin-top: $unnnic-spacing-stack-sm;

  &__button {
    width: 100%;
    margin-top: $unnnic-spacing-stack-md;
  }

  &__separator {
    border: 1px solid $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0;
  }
}

.weni-update-project__title {
  display: flex;
  font-size: $unnnic-font-size-title-sm;
  font-weight: $unnnic-font-weight-bold;
  line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  margin: 0 0 $unnnic-spacing-stack-xs;
  color: $unnnic-color-neutral-black;
}

.weni-update-project__description {
  font-size: $unnnic-font-size-body-gt;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  margin: 0;
  color: $unnnic-color-neutral-cloudy;
}
</style>
