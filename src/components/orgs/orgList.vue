<template>
  <div class="weni-org-list">
    <org-list-item
      v-for="org in orgs"
      :key="org.uuid"
      :name="org.name"
      :description="org.description"
      @select="onSelectOrg(org.uuid)"
      @delete="onDelete(org.uuid)"/>
  <unnnic-modal
    :show-modal="deleteConfirmationOpen" 
    closeIcon
    text="Organização excluída com sucesso!"
    description="A organização Weni foi excluída, um e-mail informativo será enviado aos membros 😉"
    scheme="feedback-green"
    icon="check-circle-1"
    @close="deleteConfirmationOpen=false"/>
  </div>
</template>

<script>
import OrgListItem from './orgListItem.vue';
import { mapActions, mapMutations } from 'vuex';
import { unnnicCallAlert, unnnicModal } from 'unnic-system-beta';

export default {
  name: 'Orgs',
  components: {
    OrgListItem,
    unnnicModal,
  },
  data() {
    return {
      deleteModalOpen: false,
      deleteConfirmationOpen: false,
      orgs: [],
      page: 1,
    };
  },
  mounted() {
    this.fetchOrgs();
  },
  methods: {
    ...mapActions(['getOrgs', 'deleteOrg']),
    ...mapMutations(['setCurrentOrgId']),
    async fetchOrgs() {
      const response = await this.getOrgs({page: this.page});
      this.orgs = response.data.results;
      // this.orgs = new Array(20).fill(this.orgs).flat();
    },
    createOrg() {
      this.luigiClient.linkManager().navigate('/orgs/create');
    },
    async onDelete(uuid) {
      try {
        await this.deleteOrg({ uuid });
        this.deleteConfirmationOpen = true;
        this.orgs = this.orgs.filter((org) => org.uuid !== uuid);
      } catch(e) {
        unnnicCallAlert({ 
          props: {
            text: "Um erro ocorreu",
            title: 'Error',
            icon: 'check-circle-1-1',
            scheme: 'feedback-red',
            position: 'bottom-right',
            closeText: this.$t('close'),
          }, seconds: 3 });
      }
    },
    onSelectOrg(uuid) {
      this.setCurrentOrgId(uuid);
      this.$emit('selected', uuid);
    },
  },
}
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnnic.scss';

    .weni-org-list {
        // align-items: flex-start;
        overflow-y: scroll;
        // overflow: hidden;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        max-height: 100%;
        // justify-content: center;
        // height: 100%;

         > * {
            margin-bottom: $unnnic-spacing-stack-xs;
        }
    }
</style>