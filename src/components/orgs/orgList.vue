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
        @open-delete-confirmation="openDeleteConfirmation(org)"
        @edit="onEdit(org)"
        @view="onViewPermissions(org)"
        @manage="onEditPermissions(org)"
      />
      <infinite-loading
        hide-error-slot
        ref="infiniteLoading"
        @infinite="infiniteHandler"
      />
    </div>

    <modal
      type="confirm"
      v-model="isDeleteConfirmationModalOpen"
      :data="deleteConfirmationModalData"
    />

    <modal
      type="alert"
      v-model="isOrganizationSuccessfullyDeletedModalOpen"
      :data="organizationSuccessfullyDeletedModalData"
    />

    <modal
      type="alert"
      v-model="isServerErrorAlertModalOpen"
      :data="serverErrorAlertModalData"
    />

    <right-side-bar
      type="change-name"
      v-model="isChangeNameBarOpen"
      :props="{
        organization: selectedOrganization,
        onFinished: (organization) => {
          selectedOrganization.name = organization.name;
          selectedOrganization.description = organization.description;
        },
      }"
    />

    <right-side-bar
      type="view-members"
      v-model="isMemberViewerBarOpen"
      :props="{
        organization: selectedOrganization,
      }"
    />

    <right-side-bar
      type="manage-members"
      v-model="isMemberManagementBarOpen"
      :props="{
        organization: selectedOrganization,
      }"
    />
  </div>
</template>

<script>
import OrgListItem from './orgListItem.vue';
import Modal from '../external/Modal.vue';
import RightSideBar from '../RightSidebar.vue';
import { mapActions, mapGetters } from 'vuex';
import InfiniteLoading from '../InfiniteLoading';
import _ from 'lodash';

export default {
  name: 'Orgs',
  components: {
    OrgListItem,
    InfiniteLoading,
    Modal,
    RightSideBar,
  },
  data() {
    return {
      orgs: [],
      orgAction: null,
      page: 1,
      complete: false,

      isDeleteConfirmationModalOpen: false,
      deleteConfirmationModalData: {},

      isOrganizationSuccessfullyDeletedModalOpen: false,
      organizationSuccessfullyDeletedModalData: {},

      isServerErrorAlertModalOpen: false,
      serverErrorAlertModalData: {},

      selectedOrganization: null,

      isChangeNameBarOpen: false,
      isMemberViewerBarOpen: false,
      isMemberManagementBarOpen: false,
    };
  },
  computed: {
    ...mapGetters(['currentOrg']),
  },
  methods: {
    ...mapActions([
      'getOrgs',
      'deleteOrg',
      'setCurrentOrg',
      'clearCurrentOrg',
      'clearCurrentProject',
    ]),

    openDeleteConfirmation(organization) {
      this.isDeleteConfirmationModalOpen = true;

      this.deleteConfirmationModalData = {
        icon: 'alert-circle-1',
        scheme: 'feedback-red',
        persistent: true,
        title: this.$t('orgs.delete.title'),
        description: this.$t('orgs.delete_confirm', { org: organization.name }),
        validate: {
          label: this.$t('orgs.delete.confirm_with_name', {
            name: organization.name,
          }),
          placeholder: this.$t('orgs.delete.confirm_with_name_placeholder'),
          text: organization.name,
        },
        cancelText: this.$t('cancel'),
        confirmText: this.$t('orgs.delete.title'),
        onConfirm: async (justClose, { setLoading }) => {
          setLoading(true);
          await this.onDelete(organization.uuid, organization.name);
          setLoading(false);

          this.isDeleteConfirmationModalOpen = false;
        },
      };
    },

    openServerErrorAlertModal({
      type = 'warn',
      title = this.$t('alerts.server_problem.title'),
      description = this.$t('alerts.server_problem.description'),
    } = {}) {
      let icon = null;
      let scheme = null;

      if (type === 'success') {
        icon = 'check-circle-1-1';
        scheme = 'feedback-green';
      } else if (type === 'warn') {
        icon = 'alert-circle-1';
        scheme = 'feedback-yellow';
      } else if (type === 'danger') {
        icon = 'alert-circle-1';
        scheme = 'feedback-red';
      }

      this.isServerErrorAlertModalOpen = true;

      this.serverErrorAlertModalData = {
        icon,
        scheme,
        title,
        description,
      };
    },

    reloadOrganizations() {
      this.reload();
    },

    async infiniteHandler($state) {
      try {
        await this.fetchOrgs();
      } catch (e) {
        $state.error();
        this.$emit('status', 'error');
      } finally {
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },
    canEdit(org) {
      return org.authorization.is_admin;
    },
    reload() {
      this.$refs.infiniteLoading.reset();
      this.page = 1;
      this.complete = false;
      this.orgs = [];
    },
    async fetchOrgs() {
      this.$emit('status', 'loading');
      const response = await this.getOrgs({ page: this.page });
      this.$emit('status', 'loaded');
      this.page = this.page + 1;
      this.orgs = [...this.orgs, ...response.data.results];
      this.complete = response.data.next == null;
    },
    async onDelete(uuid, name) {
      try {
        await this.deleteOrg({ uuid });
        if (_.get(this.currentOrg, 'uuid') === uuid) {
          this.clearCurrentOrg();
        }
        this.showDeleteConfirmation(name);
        this.reload();
      } catch (e) {
        this.openServerErrorAlertModal();
      }
    },
    showDeleteConfirmation(name) {
      this.isOrganizationSuccessfullyDeletedModalOpen = true;

      this.organizationSuccessfullyDeletedModalData = {
        icon: 'check-circle-1-1',
        scheme: 'feedback-green',
        title: this.$t('orgs.delete_confirmation_title'),
        description: this.$t('orgs.delete_confirmation_text', {
          name,
        }),
      };
    },
    onEdit(org) {
      this.selectedOrganization = org;
      this.isChangeNameBarOpen = true;
    },
    onEditPermissions(org) {
      this.selectedOrganization = org;
      this.isMemberManagementBarOpen = true;
    },
    onViewPermissions(org) {
      this.selectedOrganization = org;
      this.isMemberViewerBarOpen = true;
    },
    onFinishEdit() {
      this.reload();
      this.orgAction = null;
    },
    onSelectOrg(org) {
      this.setCurrentOrg(org);
      this.clearCurrentProject();
      this.$router.push('/projects/list');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-org-list {
  font-family: $unnnic-font-family-secondary;
  -ms-overflow-style: none; /* IE and Edge */
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
    background-color: rgba(0, 0, 0, 0.4);
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
