<template>
  <UnnnicFormElement
    class="unnnic-form-element"
    :label="$t('SIDEBAR.ORGANIZATION')"
    fixedLabel
    size="sm"
  >
    <UnnnicSelect
      :value="loading ? null : currentOrg.uuid"
      @onChange="changeOrg"
      :placeholder="loading ? $t('loading') : null"
      :disabled="loading"
      :key="$store.state.Org.orgs.data.length"
      size="sm"
      :optionsHeader="optionsHeader"
    >
      <div
        class="unnnic--clickable"
        slot="header"
        @click="allOrgs()"
      >
        {{ $t('NAVBAR.ALL_ORGANIZATIONS') }}
      </div>
      <option
        v-for="org in $store.state.Org.orgs.data"
        :value="org.uuid"
        :key="org.uuid"
      >
        {{ org.name }}
      </option>
    </UnnnicSelect>
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

    loading() {
      return this.$store.state.Org.orgs.status === 'loading';
    },

    optionsHeader() {
      return [
        {
          text: this.$t('NAVBAR.ORGANIZATION_CREATE'),
          click: () => {
            this.$router.push({
              name: 'create_org',
            });
          },
        },
      ];
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
