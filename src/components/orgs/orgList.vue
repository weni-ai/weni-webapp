<template>
  <div class="weni-org-list__wrapper">
    <div class="weni-org-list">
      <org-list-item
        v-for="org in orgsFiltered"
        :key="org.uuid"
        :name="org.name"
        :description="org.description"
        :members="org.authorizations.users"
        :can-edit="canEdit(org)"
        :can-edit-billing="canSeeBilling(org)"
        :role="org.authorization.role"
        :org="org"
        @select="onSelectOrg(org)"
        @open-delete-confirmation="openLeaveConfirmation(org)"
        @edit="onEdit(org)"
        @billing="onNavigateToBilling(org)"
        @view="onViewPermissions(org)"
        @manage="onEditPermissions(org)"
      />

      <new-infinite-loading
        v-model="isInifiniteLoadingShowed"
        :complete="$store.state.Org.orgs.status === 'complete'"
      >
        <div :style="{ display: 'flex' }">
          <div :style="{ flex: 1, marginRight: '1rem' }">
            <unnnic-skeleton-loading tag="div" width="100%" height="32px" />
            <unnnic-skeleton-loading tag="div" width="100%" height="19px" />
            <unnnic-skeleton-loading
              tag="div"
              width="100%"
              height="19px"
              :style="{ marginBottom: '1rem' }"
            />

            <div :style="{ display: 'flex' }">
              <unnnic-skeleton-loading
                tag="div"
                width="64px"
                height="24px"
                :style="{ marginRight: '0.5rem' }"
              />
              <unnnic-skeleton-loading tag="div" width="211px" height="24px" />
            </div>
          </div>

          <div :style="{ display: 'flex', alignItems: 'center' }">
            <unnnic-skeleton-loading
              tag="div"
              width="73px"
              height="38px"
              :style="{ marginRight: '0.5rem' }"
            />
            <unnnic-skeleton-loading tag="div" width="17px" height="38px" />
          </div>
        </div>
      </new-infinite-loading>
    </div>

    <right-side-bar
      type="change-name"
      v-model="isChangeNameBarOpen"
      :props="{
        organization: selectedOrganization,
        onFinished: (organization) => {
          selectedOrganization.name = organization.name;
          selectedOrganization.description = organization.description;
        },
        onFinished2FA: (status) => {
          selectedOrganization.enforce_2fa = status;
        },
      }"
      @reload-organizations="reloadOrganizations"
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
        onFinished: reloadOrganizations,
      }"
    />
  </div>
</template>

<script>
import OrgListItem from './orgListItem.vue';
import RightSideBar from '../RightSidebar.vue';
import { mapActions, mapState, mapGetters } from 'vuex';
import NewInfiniteLoading from '../NewInfiniteLoading.vue';

export default {
  name: 'Orgs',
  components: {
    OrgListItem,
    NewInfiniteLoading,
    RightSideBar,
  },

  props: {
    filterName: String,
    ordering: String,
  },

  data() {
    return {
      orgs: [],
      page: 1,

      isInifiniteLoadingShowed: false,
      hadFirstLoading: false,

      selectedOrganization: null,

      isChangeNameBarOpen: false,
      isMemberViewerBarOpen: false,
      isMemberManagementBarOpen: false,
    };
  },
  computed: {
    ...mapGetters(['currentOrg']),

    ...mapState({
      accountProfile: (state) => state.Account.profile,
    }),

    orgsFiltered() {
      const orgs = this.$store.state.Org.orgs.data;

      if (this.ordering) {
        orgs.sort((a, b) => {
          let first = null;
          let second = null;

          if (this.ordering === 'alphabetical') {
            first = a.name.toLowerCase();
            second = b.name.toLowerCase();
          } else if (this.ordering === 'newer') {
            first = new Date(b.created_at).getTime();
            second = new Date(a.created_at).getTime();
          } else if (this.ordering === 'older') {
            first = new Date(a.created_at).getTime();
            second = new Date(b.created_at).getTime();
          }

          return first === second ? 0 : first > second ? 1 : -1;
        });
      }

      if (!this.filterName.trim()) {
        return orgs;
      }

      return orgs.filter(({ name }) =>
        name.toLowerCase().includes(this.filterName.trim().toLowerCase()),
      );
    },
  },

  watch: {
    isInifiniteLoadingShowed() {
      if (
        this.isInifiniteLoadingShowed &&
        this.$store.state.Org.orgs.status !== 'loading' &&
        this.$store.state.Org.orgs.status !== 'complete'
      ) {
        this.fetchOrgs();
      }
    },

    ordering: {
      immediate: true,

      handler() {
        if (this.ordering && this.$store.state.Org.orgs.status !== 'complete') {
          this.fetchOrgs();
        }
      },
    },
  },

  methods: {
    ...mapActions([
      'getOrgs',
      'getNextOrgs',
      'deleteOrg',
      'leaveOrg',
      'setCurrentOrg',
      'clearCurrentOrg',
      'clearCurrentProject',
      'openModal',
    ]),

    openLeaveConfirmation(organization) {
      this.openModal({
        type: 'confirm',
        data: {
          persistent: true,
          icon: 'alert-circle-1',
          scheme: 'feedback-red',
          title: this.$t('orgs.leave.title'),
          description: this.$t('orgs.leave_description'),
          validate: {
            label: this.$t('orgs.leave.confirm_with_name', {
              name: organization.name,
            }),
            placeholder: this.$t('orgs.leave.confirm_with_name_placeholder'),
            text: organization.name,
          },
          cancelText: this.$t('cancel'),
          confirmText: this.$t('orgs.leave.title'),
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            await this.leaveOrg({
              orgId: organization.uuid,
              id: this.accountProfile.id,
            });

            this.openModal({
              type: 'alert',
              data: {
                icon: 'check-circle-1-1',
                scheme: 'feedback-green',
                title: this.$t('orgs.users.left', { name: organization.name }),
                description: this.$t('orgs.users.left_description'),
              },
            });

            this.reloadOrganizations();

            setLoading(false);

            justClose();
          },
        },
      });
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

      this.openModal({
        type: 'alert',
        data: {
          icon,
          scheme,
          title,
          description,
        },
      });
    },

    async infiniteHandler($state) {
      try {
        await this.fetchOrgs();
      } catch (e) {
        $state.error();
        this.$emit('status', 'error');
      } finally {
        if (this.$store.state.Org.orgs.status === 'complete') $state.complete();
        else $state.loaded();
      }
    },
    canEdit(org) {
      return org.authorization.is_admin;
    },
    canSeeBilling(org) {
      const validator = org.organization_billing?.plan !== 'custom';
      return validator;
    },
    reloadOrganizations() {
      this.$store.state.Org.orgs.page = 1;
      this.$store.state.Org.orgs.status = null;
      this.$store.state.Org.orgs.data = [];
    },
    async fetchOrgs() {
      if (
        !this.$store.state.Org.orgs.data.length &&
        this.$store.state.Org.orgs.status !== 'complete'
      ) {
        this.$emit('status', 'loading');
        this.hadFirstLoading = true;
      }

      await this.getNextOrgs({ page: this.page });

      this.$emit('status', 'loaded');

      if (
        this.$store.state.Org.orgs.data.length === 0 &&
        this.$store.state.Org.orgs.status === 'complete'
      ) {
        this.$emit('status', 'empty');
      }

      setTimeout(() => {
        if (
          this.$store.state.Org.orgs.status !== 'complete' &&
          (this.isInifiniteLoadingShowed || this.ordering)
        ) {
          this.fetchOrgs();
        }
      });
    },
    showDeleteConfirmation(name) {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('orgs.delete_confirmation_title'),
          description: this.$t('orgs.delete_confirmation_text', {
            name,
          }),
        },
      });
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
    selectOrg(org) {
      this.setCurrentOrg(org);
      this.clearCurrentProject();
    },
    onSelectOrg(org) {
      this.selectOrg(org);
      this.$router.push({
        name: 'projects',
        params: {
          orgUuid: org.uuid,
        },
      });
    },
    onNavigateToBilling(org) {
      this.selectOrg(org);
      this.$router.push({
        name: 'billing',
        params: {
          orgUuid: org.uuid,
        },
      });
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
  display: grid;

  grid-gap: $unnnic-spacing-inline-sm;
  grid-template-columns: repeat(auto-fill, minmax(21.75rem, 1fr));

  &__wrapper {
    height: 100%;
  }

  &::-webkit-scrollbar {
    display: none;
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
