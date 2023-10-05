<template>
  <unnnic-form-element
    class="unnnic-form-element"
    :label="$t('SIDEBAR.ORGANIZATION')"
    fixed-label
    size="sm"
  >
    <unnnic-select
      :value="loading ? null : currentOrg.uuid"
      @onChange="changeOrg"
      :placeholder="loading ? $t('loading') : null"
      :disabled="loading"
      :key="$store.state.Org.orgs.data.length"
      size="sm"
      :options-header="optionsHeader"
    >
      <div class="unnnic--clickable" slot="header" @click="allOrgs()">
        {{ $t('NAVBAR.ALL_ORGANIZATIONS') }}
      </div>
      <option
        v-for="org in $store.state.Org.orgs.data"
        :value="org.uuid"
        :key="org.uuid"
      >
        {{ org.name }}
      </option>
    </unnnic-select>
  </unnnic-form-element>
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
      const response = await projects.list(uuid, 0, 1);

      const project = get(response, 'data.results.0');

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
