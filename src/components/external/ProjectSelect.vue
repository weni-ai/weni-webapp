<template>
  <unnnic-select
    v-model="project"
    :placeholder="orgName"
    :disabled="loading"
    :key="loading"
    size="sm"
    :options-header="optionsHeader"
  >
    <div class="unnnic--clickable" slot="header" @click="allProjects()">
      {{ $t('NAVBAR.ALL_PROJECTS') }}
    </div>
    <option v-if="projects.length === 0 && project" :value="project">
      {{ projectName }}
    </option>
    <option
      v-for="project in projects"
      :value="project.uuid"
      :key="project.uuid"
    >
      {{ project.name }}
    </option>
  </unnnic-select>
</template>

<script>
import { unnnicSelect } from '@weni/unnnic-system';
import projects from '../../api/projects';
export default {
  name: 'ProjectSelect',
  components: {
    unnnicSelect,
  },
  props: {
    org: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      project: this.currentProject,
      projectName: '',
      projects: [],
    };
  },
  computed: {
    orgName() {
      if (!this.org) return null;
      return this.org.name;
    },

    optionsHeader() {
      return [
        {
          text: this.$t('NAVBAR.PROJECT_CREATE'),
          click: () => {
            this.$router.push('/projects/create');
          },
        },
      ];
    },
  },
  mounted() {
    this.fetchProjects();
    this.getCurrentProject();
  },
  methods: {
    getCurrentProject() {
      var project = localStorage.getItem('_project');
      try {
        project = JSON.parse(project);
        if (project.organization.uuid !== this.org.uuid) this.project = null;
        else {
          this.project = project.uuid;
          this.projectName = project.name;
        }
      } catch (e) {
        return;
      }
    },
    allProjects() {
      this.$router.push('/projects/list');
    },
    async fetchProjects() {
      this.loading = true;
      try {
        const response = await projects.externalList(
          null,
          this.org.uuid,
          0,
          10,
        );
        this.page = this.page + 1;
        this.projects = response.data.results;
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    project() {
      const project = this.projects.find(
        (project) => project.uuid === this.project,
      );
      if (!project) return;

      const projectObject = {
        uuid: project.uuid,
        organization: {
          uuid: project.organization,
        },
        name: project.name,
        flow_organization: {
          uuid: project.flow_organization,
          id: project.flow_organization_id,
        },
        menu: project.menu,
      };

      window.localStorage.setItem('_project', JSON.stringify(projectObject));
      this.$emit('select', this.project);
    },
  },
};
</script>
