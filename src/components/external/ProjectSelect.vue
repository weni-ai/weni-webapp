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
import { unnnicSelect } from '@weni/unnnic-system';
import projects from '../../api/projects';
import { mapActions, mapGetters } from 'vuex';

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
            this.$router.push('/projects/create');
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
    projectUuid() {
      const project = this.projects.find(
        (project) => project.uuid === this.projectUuid,
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

      this.setCurrentProject(projectObject);
      this.$router.go();
    },
  },
};
</script>
