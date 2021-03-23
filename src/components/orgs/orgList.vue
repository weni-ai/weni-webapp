<template>
<div class="weni-org-list__wrapper">
  <div class="weni-org-list">
    <org-list-item
      v-for="org in orgs"
      :key="org.uuid"
      :name="org.name"
      :description="org.description"
      :members="org.authorizations.users"
      :can-edit="canEdit(org)"
      @select="onSelectOrg(org)"
      @delete="onDelete(org.uuid, org.name)"
      @edit="onEdit(org)"
      @view="onViewPermissions(org)"
      @manage="onEditPermissions(org)"/>
    <infinite-loading ref="infiniteLoading" @infinite="infiniteHandler" />
  </div>
  <div class="weni-org-list__side-menu" v-if="orgAction">
      <div class="weni-org-list__side-menu__content">
        <div class="weni-org-list__side-menu__content__info">
          <unnnic-icon
            clickable
            icon="keyboard-arrow-left-1"
            @click="orgAction = null" />
          <div class="weni-org-list__side-menu__content__info__text">
            <h1> {{ orgAction.title }} </h1>
            <h2> {{ orgAction.description }} </h2>
          </div>
        </div>
        <div class="weni-org-list__side-menu__separator" />
        <component
          class="weni-org-list__side-menu__component"
          :is="orgAction.component"
          :org="orgAction.org"
          @finish="orgAction.onFinished($event)" />
      </div>
    </div>
</div>
</template>

<script>
import OrgListItem from './orgListItem.vue';
import updateOrg from './updateOrg';
import orgPermissions from './orgPermissions';
import orgPermissionsRead from './orgPermissionsRead';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { unnnicCallAlert, unnnicCallModal } from '@weni/unnnic-system';
import InfiniteLoading from '../InfiniteLoading';
import Loading from '../Loading';

export default {
  name: 'Orgs',
  components: {
    OrgListItem,
    InfiniteLoading,
    Loading,
    orgPermissionsRead,
  },
  data() {
    return {
      orgs: [],
      orgAction: null,
      page: 1,
      complete: false,
    };
  },
  computed: {
    ...mapGetters(['getCurrentOrgId']),
  },
  methods: {
    ...mapActions(['getOrgs', 'deleteOrg']),
    ...mapMutations(['setCurrentOrg']),
    async infiniteHandler($state) {
      try {
        await this.fetchOrgs();
      } catch(e) {
        $state.error();
      } finally {
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },
    canEdit(org) {
      if (!(org.authorization && org.authorization.role)) return false;
      return org.authorization.role >= 3;
    },
    reload() {
      this.$refs.infiniteLoading.reset();
      this.page = 1;
      this.complete = false;
      this.orgs = [];
    },
    async fetchOrgs() {
      const response = await this.getOrgs({page: this.page});
      this.page = this.page + 1;
      this.orgs = [...this.orgs, ...response.data.results];
      this.complete = response.data.next == null;
    },
    async onDelete(uuid, name) {
      try {
        await this.deleteOrg({ uuid });
        if(this.getCurrentOrgId() === uuid) {
          this.setCurrentOrg(null);
          this.luigiClient.sendCustomMessage({id: 'change-org'});
        }
        this.showDeleteConfirmation(name);
        this.reload();
      } catch(e) {
        console.log(e);
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
    showDeleteConfirmation(name) {
        unnnicCallModal({
          props: {
            text: this.$t('orgs.delete_confirmation_title'),
            description: this.$t('orgs.delete_confirmation_text', { name }),
            scheme: "feedback-green",
            icon: "check-circle-1",
          }
        });
    },
    onEdit(org) {
      this.orgAction = {
        org,
        title: this.$t('orgs.change_name'),
        description: this.$t('orgs.change_name_description'),
        action: 'edit',
        component: updateOrg,
        onFinished: () => this.onFinishEdit(),
      }
    },
    onEditPermissions(org) {
      this.orgAction = {
        org,
        title: this.$t('orgs.manage_members'),
        description: this.$t('orgs.manage_members_description'),
        component: orgPermissions,
        onFinished: () => { 
          this.orgAction = null;
          this.reload();
        },
      }
    },
    onViewPermissions(org) {
      this.orgAction = {
        org,
        title: this.$t('orgs.view_members'),
        description: this.$t('orgs.view_members_description'),
        component: orgPermissionsRead,
        onFinished: () => { this.orgAction = null; },
      }
    },
    onFinishEdit() {
      this.reload();
      this.orgAction = null;
    },
    onSelectOrg(org) {
      const { name, uuid, inteligence_organization } = org;
      this.setCurrentOrg({ name, uuid, inteligence_organization, });
      this.luigiClient.sendCustomMessage({id: 'change-org'});
      this.$emit('selected', uuid);
    },
  },
}
</script>

<style lang="scss" scoped>
    @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

    .weni-org-list {
        font-family: $unnnic-font-family-secondary;
        overflow-y: scroll;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;
        display: flex;
        flex-direction: column;
        min-height: min-content;
        height: 100%;

        &__wrapper {
          height: 100%;
        }

        &::-webkit-scrollbar {
           display: none;
        }

         > * {
          margin-bottom: $unnnic-spacing-stack-xs;
        }

        > :only-child {
          margin: auto 0;
        }

        > :first-child {
          margin: auto 0 $unnnic-spacing-stack-xs 0; 
        }

        > :last-child {
          margin: $unnnic-spacing-stack-xs 0 auto 0;
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

          &__component {
            flex: 1;
          }
          
          &__content {
            max-width: 500px;
            padding: 32px;
            background-color: white;
            display: flex;
            flex-direction: column;

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