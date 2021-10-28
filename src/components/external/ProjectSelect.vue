<template>
  <unnnic-select
    v-model="projectUuid"
    :placeholder="orgName"
    :disabled="loading"
    :key="loading"
    size="sm"
    :options-header="optionsHeader"
  >
    <div class="unnnic--clickable" slot="header" @click="allProjects()">
      {{ $t('NAVBAR.ALL_PROJECTS') }}
    </div>
    <option v-if="projects.length === 0 && projectUuid" :value="projectUuid">
      {{ currentProject.name }}
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
import projects from '../../api/projects';
import { mapActions, mapGetters } from 'vuex';

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
      loading: false,
      projectUuid: '',
      projects: [],
    };
  },
  computed: {
    ...mapGetters(['currentProject']),

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

  created() {
    this.projectUuid = this.currentProject.uuid;
  },

  mounted() {
    this.fetchProjects();
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
    projectUuid() {
      const project = this.projects.find(
        (project) => project.uuid === this.projectUuid,
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
