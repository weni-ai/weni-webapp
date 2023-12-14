<template>
  <unnnic-form-element
    class="unnnic-form-element"
    :label="$t('SIDEBAR.PROJECT')"
    fixed-label
    size="sm"
  >
    <unnnic-select
      v-if="canCreateProject"
      :value="currentProject.uuid"
      @onChange="changeProject"
      :placeholder="projects.status === 'loading' ? $t('loading') : null"
      :disabled="projects.status === 'loading'"
      :key="projects.data.length"
      size="sm"
      :options-header="optionsHeader"
    >
      <div class="unnnic--clickable" slot="header" @click="allProjects()">
        {{ $t('NAVBAR.ALL_PROJECTS') }}
      </div>
      <option
        v-for="project in projects.data"
        :value="project.uuid"
        :key="project.uuid"
      >
        {{ project.name }}
      </option>
    </unnnic-select>

    <unnnic-input-next
      v-else
      size="sm"
      :value="currentProject.name"
      icon-right="arrow-button-down-1"
      disabled
    ></unnnic-input-next>
  </unnnic-form-element>
</template>

<script>
import projects from '../../api/projects';
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

    optionsHeader() {
      return [
        {
          text: this.$t('NAVBAR.PROJECT_CREATE'),
          click: () => {
            this.$router.push({
              name: 'project_create',
              params: {
                orgUuid: this.org.uuid,
              },
            });
          },
        },
      ];
    },
  },

  mounted() {
    this.fetchProjects();
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
    async fetchProjects() {
      this.loading = true;
      let hasNext = false;
      try {
        const response = await projects.externalList(
          null,
          this.org.uuid,
          this.page * 10,
          10,
        );
        this.page = this.page + 1;
        this.projects = this.projects.concat(response.data.results);

        hasNext = response.data.next;
      } finally {
        this.loading = false;
      }

      if (hasNext) {
        this.fetchProjects();
      }
    },

    changeProject(uuid) {
      const project = this.projects.data.find(
        (project) => project.uuid === uuid,
      );

      if (!project) return;

      this.setCurrentProject(project);

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
