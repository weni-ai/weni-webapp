<template>
  <UnnnicFormElement
    class="unnnic-form-element"
    :label="$t('SIDEBAR.ORGANIZATION')"
    fixedLabel
    size="sm"
  >
    <UnnnicSelectSmart
      :key="$store.state.Org.orgs.data.length"
      :disabled="loading"
      size="sm"
      :modelValue="
        loading
          ? []
          : [
              $store.state.Org.orgs.data
                .map(({ name, uuid }) => ({
                  value: uuid,
                  label: name,
                }))
                .find(({ value }) => value === currentOrg.uuid) || null,
            ]
      "
      :options="
        [
          {
            value: '',
            label: $t('loading'),
          },
          {
            value: 'create',
            label: $t('NAVBAR.ORGANIZATION_CREATE'),
          },
          {
            value: 'see all',
            label: $t('NAVBAR.ALL_ORGANIZATIONS'),
          },
        ].concat(
          $store.state.Org.orgs.data.map(({ name, uuid }) => ({
            value: uuid,
            label: name,
          })),
        )
      "
      orderedByIndex
      @update:model-value="changeOrg($event[0].value)"
    />
  </UnnnicFormElement>
</template>

<script>
import projects from '../../api/projects';
import { mapActions, mapGetters } from 'vuex';
import { get } from 'lodash';

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
      projects: [],
      page: 0,
    };
  },

  computed: {
    ...mapGetters(['currentProject', 'currentOrg']),

    currentOrgUuid() {
      return this.currentOrg.uuid;
    },

    loading() {
      return this.$store.state.Org.orgs.status === 'loading';
    },
  },

  watch: {
    '$store.state.Org.orgs.status': {
      immediate: true,

      handler(status) {
        if (status === null) {
          this.$store.dispatch('getNextOrgs');
        }
      },
    },
  },

  methods: {
    ...mapActions(['setCurrentProject', 'setCurrentOrg']),

    allOrgs() {
      this.$router.push({
        name: 'orgs',
      });
    },

    async changeOrg(uuid) {
      if (uuid === this.currentOrgUuid) {
        return;
      }

      if (uuid === 'create') {
        this.$router.push({
          name: 'create_org',
        });
        return;
      }

      if (uuid === 'see all') {
        this.allOrgs();
        return;
      }

      let project = null;

      const orgProjects = this.$store.state.Project.projects.find(
        ({ orgUuid }) => orgUuid === uuid,
      );

      if (orgProjects && orgProjects.data.length) {
        project = orgProjects.data[0];
      } else {
        const response = await projects.list(uuid, 0, 1);

        project = get(response, 'data.results.0');
      }

      const org = this.$store.state.Org.orgs.data.find(
        (item) => item.uuid === uuid,
      );

      this.setCurrentOrg(org);
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
