<template>
  <div class="weni-org-list">
    <org-list-item
      v-for="org in orgs"
      :key="org.uuid"
      :name="org.name"
      :description="org.description"
      :members="org.authorizations.users"
      @select="onSelectOrg(org.uuid)"
      @delete="onDelete(org.uuid)"
      @edit="onEdit(org)"
      @manage="onEditPermissions(org)"/>
    <div class="weni-org-list__side-menu" v-if="orgAction">
      <div class="weni-org-list__side-menu__content">
        <div class="weni-org-list__side-menu__content__info">
          <unnnic-icon clickable icon="keyboard-arrow-left-1" @click="orgAction = null" />
          <div class="weni-org-list__side-menu__content__info__text">
            <h1> {{ orgAction.title }} </h1>
            <h2> {{ orgAction.description }} </h2>
          </div>
        </div>
        <div class="weni-org-list__side-menu__separator" />
        <component
          :is="orgAction.component"
          :org="orgAction.org"
          @finish="orgAction.onFinished($event)" />
      </div>
    </div>
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
import updateOrg from './updateOrg';
import orgPermissions from './orgPermissions';
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
      orgAction: null,
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
    onEdit(org) {
      this.orgAction = {
        org,
        title: this.$t('orgs.change_name'),
        description: this.$t('orgs.change_name_description'),
        action: 'edit',
        component: updateOrg,
        onFinished: (org) => this.onFinishEdit(org),
      }
    },
    onEditPermissions(org) {
      this.orgAction = {
        org,
        title: this.$t('orgs.manage_members'),
        description: this.$t('orgs.manage_members_description'),
        action: 'edit',
        component: orgPermissions,
        onFinished: (org) => this.onFinishEdit(org),
      }
    },
    onFinishEdit(edited) {
      const index = this.orgs.findIndex(org => org.uuid === edited.uuid);
      console.log(index, edited);
      if (index < 0) return;
      this.orgs.splice(index, 1, { ...this.orgs[index], ...edited });
      console.log(this.orgs);
      this.orgAction = null;
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
        font-family: $unnnic-font-family-secondary;
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

        &__side-menu {
          position: fixed;
          background-color: rgba(0, 0, 0, 0.4);;
          z-index: 500;
          display: flex;
          justify-content: flex-end;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;

          &__separator {
            border: 1px solid $unnnic-color-neutral-soft;
            margin: $unnnic-spacing-stack-md 0 1rem 0;
          }
          
          &__content {
            max-width: 500px;
            padding: 32px;
            background-color: white;

            h1 {
              margin: 0;
              font-size: $unnnic-font-size-title-sm;
              font-weight: $unnnic-font-weight-bold;
              line-height: $unnnic-font-size-title-sm + $unnnic-line-height-medium;
            }

            h2 {
              margin: 0;
              font-weight: $unnnic-font-weight-regular;
              font-size: $unnnic-font-size-body-gt;
              line-height: $unnnic-font-size-title-sm + $unnnic-line-height-medium;
              color: $unnnic-color-neutral-cloudy;
            }

            &__info {
            display: flex;
              &__text {
                flex: 1;
                margin-left: 1rem;
              }
            }
          }
        }
    }
</style>