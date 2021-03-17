<template>
  <unnnic-select :disabled="loading" size="sm">
    <div class="unnnic--clickable" slot="header" @click="allProjects()"> {{ getTranslation('NAVBAR.ALL_PROJECTS') }} </div>
    <option v-for="project in projects" :value="project.uuid" :key="project.uuid"> {{ project.name }} </option>
  </unnnic-select>
</template>

<script>
import { unnnicSelect } from 'unnic-system-beta';
import projects from '../../api/projects'
export default {
  name: 'ProjectSelect',
  components: {
    unnnicSelect,
  },
  props: {
    org: {
      type: String,
      required: true,
    },
    currentProject: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      project: this.currentProject,
      projects: [],
    };
  },
  mounted() {
    return this.fetchProjects();
  },
  methods: {
    getTranslation(label) {
      return window.Luigi.getConfigValue('settings.customTranslationImplementation').getTranslation(label);
    },
    allProjects() {
      window.Luigi.navigation().navigate('/projects/list');
    },
    async fetchProjects() {
      this.loading = true;
      try {
        const response = await projects.externalList(
          window.parent.Luigi.auth().store.getAuthData().accessToken,
          this.org,
          0,
          10
        );
        this.page = this.page + 1;
        this.projects = response.data.results;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>