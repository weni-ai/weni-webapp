<template>
  <UnnnicFormElement
    class="unnnic-form-element"
    :label="$t('SIDEBAR.PROJECT')"
    fixedLabel
    size="sm"
  >
    <UnnnicSelectSmart
      v-if="canCreateProject"
      :disabled="projects.status === 'loading'"
      :key="projects.data.length"
      size="sm"
      :value="
        projects.status === 'loading'
          ? []
          : [
              projects.data
                .map(({ name, uuid }) => ({
                  value: uuid,
                  label: name,
                }))
                .find(({ value }) => value === currentProject.uuid) || null,
            ]
      "
      @input="changeProject($event[0].value)"
      :options="
        [
          {
            value: '',
            label: $t('loading'),
          },
          {
            value: 'create',
            label: $t('NAVBAR.PROJECT_CREATE'),
          },
          {
            value: 'see all',
            label: $t('NAVBAR.ALL_PROJECTS'),
          },
        ].concat(
          projects.data.map(({ name, uuid }) => ({
            value: uuid,
            label: name,
          })),
        )
      "
      orderedByIndex
    />

    <UnnnicInput
      v-else
      size="sm"
      :value="currentProject.name"
      iconRight="arrow-button-down-1"
      disabled
    ></UnnnicInput>
  </UnnnicFormElement>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { ORG_ROLE_ADMIN, ORG_ROLE_CONTRIBUTOR } from '../orgs/orgListItem.vue';

export default {
  name: 'ProjectSelect',
  props: {
    org: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      page: 0,
    };
  },
  computed: {
    ...mapGetters(['currentProject']),

    projects() {
      return this.$store.state.Project.projects.find(
        ({ orgUuid }) => orgUuid === this.org.uuid,
      );
    },

    canCreateProject() {
      return [ORG_ROLE_ADMIN, ORG_ROLE_CONTRIBUTOR].includes(
        this.$store.getters.org.authorization.role,
      );
    },

    orgName() {
      if (!this.org) return null;
      return this.org.name;
    },
  },

  watch: {
    'projects.status': {
      immediate: true,
      handler(status) {
        if (status !== 'complete') {
          this.$store.dispatch('loadProjects', {
            orgUuid: this.org.uuid,
            ordering: '-created_at',
          });
        }
      },
    },
  },

  methods: {
    ...mapActions(['setCurrentProject']),

    allProjects() {
      this.$router.push({
        name: 'projects',
        params: {
          orgUuid: this.org.uuid,
        },
      });
    },

    changeProject(uuid) {
      if (uuid === this.currentProject.uuid) {
        return;
      }

      if (uuid === 'create') {
        this.$router.push({
          name: 'project_create',
          params: {
            orgUuid: this.org.uuid,
          },
        });
        return;
      }

      if (uuid === 'see all') {
        this.allProjects();
        return;
      }

      const project = this.projects.data.find(
        (project) => project.uuid === uuid,
      );

      if (!project) return;

      this.setCurrentProject(project);

      const insightsIframe = document.querySelector('iframe[name="insights"]');

      insightsIframe.contentWindow.postMessage(
        { event: 'setProject', projectUuid: project.uuid },
        '*',
      );

      this.$router.push({
        params: {
          projectUuid: project.uuid,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.unnnic-form-element :deep(.label) {
  z-index: 2;
}
</style>
