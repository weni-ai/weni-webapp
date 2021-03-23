<template>
  <unnnic-select
    v-model="project"
    :placeholder="orgName"
    :disabled="loading"
    :key="loading"
    size="sm">
    <div
      class="unnnic--clickable"
      slot="header"
      @click="allProjects()">
      {{ getTranslation('NAVBAR.ALL_PROJECTS') }}
    </div>
    <option v-if="projects.length === 0 && project" :value="project"> {{ projectName }} </option>
    <option
      v-for="project in projects"
      :value="project.uuid"
      :key="project.uuid">
        {{ project.name }}
    </option>
  </unnnic-select>
</template>

<script>
import { unnnicSelect } from '@weni/unnnic-system';
import projects from '../../api/projects'
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
  },
  mounted() {
    this.fetchProjects();
    this.getCurrentProject();
  },
  methods: {
    getCurrentProject() {
      var project = localStorage.getItem('project');
      try {
        project = JSON.parse(project);
      } catch(e) {
        return;
      }
      if (project.org !== this.org.uuid) this.project = null;
      else { 
        this.project = project.project;
        this.projectName = project.projectName;
      }
    },
    getTranslation(label) {
      return window.Luigi.i18n().getTranslation(label);
    },
    allProjects() {
      window.Luigi.navigation().navigate('/projects/list');
    },
    async fetchProjects() {
      this.loading = true;
      try {
        const response = await projects.externalList(
          window.parent.Luigi.auth().store.getAuthData().accessToken,
          this.org.uuid,
          0,
          10
        );
        this.page = this.page + 1;
        this.projects = response.data.results;
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    project() {
      const project = this.projects.find((project) => project.uuid === this.project);
      if (!project) return;
      window.localStorage.setItem('project', JSON.stringify({ project: project.uuid, org: this.org.uuid, projectName: project.name, projectFlow_organization: project.flow_organization, }));
      this.$emit('select', this.project);
    },
  }
}
</script>