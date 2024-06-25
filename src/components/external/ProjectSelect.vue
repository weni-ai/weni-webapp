<template>
  <UnnnicFormElement
    class="unnnic-form-element"
    :label="$t('SIDEBAR.PROJECT')"
    fixedLabel
    size="sm"
  >
    <UnnnicSelect
      v-if="canCreateProject"
      :value="currentProject.uuid"
      @onChange="changeProject"
      :placeholder="projects.status === 'loading' ? $t('loading') : null"
      :disabled="projects.status === 'loading'"
      :key="projects.data.length"
      size="sm"
      :optionsHeader="optionsHeader"
    >
      <div
        class="unnnic--clickable"
        slot="header"
        @click="allProjects()"
      >
        {{ $t('NAVBAR.ALL_PROJECTS') }}
      </div>
      <option
        v-for="project in projects.data"
        :value="project.uuid"
        :key="project.uuid"
      >
        {{ project.name }}
      </option>
    </UnnnicSelect>

    <UnnnicInputNext
      v-else
      size="sm"
      :value="currentProject.name"
      iconRight="arrow-button-down-1"
      disabled
    ></UnnnicInputNext>
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
