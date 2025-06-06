<template>
  <div class="weni-org-permissions">
    <UserManagement
      :type="type"
      :users="users"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }"
      :searchName="searchName"
      :org="org"
      :alreadyAddedText="$t('orgs.users.already_in')"
      :loading="loadingAddMember"
      @update:users="users = $event"
      @fetch-permissions="fetchPermissions"
      @reset="resetFetch"
      @add="addMember"
      @remove-user="removeUser"
      @change-role="changeRole"
      @finish="$emit('finish')"
    ></UserManagement>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Unnnic from '@weni/unnnic-system';
import UserManagement from '../../orgs/UserManagement.vue';
import _ from 'lodash';
import orgs from '../../../api/orgs';

export default {
  name: 'OrgPermissions',

  components: {
    UserManagement,
  },

  props: {
    type: {
      type: String,
      default: 'manage',
    },

    orgUuid: {
      type: String,
      required: true,
    },
  },

  emits: ['close', 'isLoading', 'finish'],

  data() {
    return {
      loading: false,
      loadingAddMember: false,
      saving: false,
      page: 1,
      complete: false,
      error: false,
      users: [],
      alreadyHadFirstLoading: false,
      searchName: '',
    };
  },

  computed: {
    org() {
      return this.$store.state.Org.orgs.data.find(
        ({ uuid }) => this.orgUuid === uuid,
      );
    },
  },

  watch: {
    loading() {
      if (!this.alreadyHadFirstLoading) {
        this.$emit('isLoading', this.loading);

        if (!this.loading) {
          this.alreadyHadFirstLoading = true;
        }
      }
    },
  },

  methods: {
    ...mapActions([
      'getMembers',
      'changeAuthorization',
      'openModal',
      'removeOrgFromList',
      'addUserToOrgAuthorizations',
    ]),

    resetFetch() {
      this.users = [];
      this.page = 0;
      this.complete = false;

      this.fetchPermissions();
    },

    async fetchPermissions($state) {
      try {
        this.loading = true;
        await this.fetchOrgMembers();
        await this.fetchPendingRequests();
      } catch (e) {
        $state?.error();
      } finally {
        this.loading = false;
        if ($state) {
          this.complete ? $state.complete() : $state.loaded();
        }
      }
    },

    async fetchOrgMembers() {
      const response = await this.getMembers({
        uuid: this.org.uuid,
        page: this.page,
        search: this.searchName,
      });

      this.page = this.page + 1;

      const mappedUsers = response.data.results.map((user) =>
        this.mapUserData(user),
      );

      this.users = _.uniqBy([...this.users, ...mappedUsers], 'uuid');
      this.complete = response.data.next == null;
    },

    async fetchPendingRequests() {
      const { data } = await orgs.listRequestPermission({
        organization: this.org.uuid,
        page: 1,
      });

      const pendingUsers = data.results.map((user) =>
        this.mapPendingUserData(user),
      );
      this.users = this.users.concat(pendingUsers);
    },

    mapUserData(user) {
      return {
        id: user.user__id,
        uuid: user.uuid,
        name: user.user__username,
        email: user.user__email,
        photo: user.user__photo,
        role: user.role,
        username: user.user__username,
      };
    },

    mapPendingUserData(user) {
      return {
        id: user.id,
        uuid: Math.random(),
        name: user.email,
        email: user.email,
        photo: null,
        role: user.role,
        username: user.email,
        status: 'pending',
        disabledRole: true,
      };
    },

    removeUser(username) {
      if (this.isCurrentUser(username)) {
        this.removeCurrentUserFromOrg();
      } else {
        this.removeOtherUserFromList(username);
      }
    },

    isCurrentUser(username) {
      return this.$store.state.Account.profile.username === username;
    },

    removeCurrentUserFromOrg() {
      this.removeOrgFromList(this.orgUuid);
      this.$emit('close');
    },

    removeOtherUserFromList(username) {
      this.users = this.users.filter((user) => user.username !== username);
    },

    async addMember(member) {
      const organizationUuid = _.get(this.org, 'uuid');
      this.loadingAddMember = true;

      try {
        const response = await orgs.createRequestPermission({
          organizationUuid,
          email: member.email,
          role: member.role,
        });

        this.processAddMemberResponse(member, response.data);
        this.addUserToList(member);
      } catch (error) {
        this.handleAddMemberError(error);
      } finally {
        this.loadingAddMember = false;
      }
    },

    processAddMemberResponse(member, responseData) {
      if (member.status === 'pending') {
        member.id = responseData.id;
      } else {
        this.updateOrgAuthorizations(member, responseData);
      }
    },

    updateOrgAuthorizations(member, responseData) {
      const [first_name, last_name] = responseData.user_data.name.split(' ');

      this.addUserToOrgAuthorizations({
        orgUuid: this.org.uuid,
        userData: {
          username: member.username,
          first_name,
          last_name,
          role: responseData.role,
          photo_user: responseData.user_data.photo,
        },
      });
    },

    addUserToList(member) {
      this.users = [
        ...this.users,
        {
          id: member.id,
          uuid: member.uuid,
          name: member.name,
          email: member.email,
          photo: member.photo,
          role: member.role,
          username: member.username,
          status: member.status,
          disabledRole: member.status === 'pending',
        },
      ];
    },

    async changeRole({ id, role }) {
      try {
        await this.changeAuthorization({
          orgId: this.org.uuid,
          username: id,
          role,
        });
        this.showSuccessNotification();
      } catch (error) {
        this.showErrorNotification();
      }
    },

    showSuccessNotification() {
      Unnnic.unnnicCallAlert({
        props: {
          text: this.$t('orgs.saved_changes_description'),
          title: this.$t('orgs.saved_changes'),
          icon: 'check_circle',
          scheme: 'feedback-green',
          position: 'bottom-right',
          closeText: this.$t('close'),
        },
        seconds: 3,
      });
    },

    showErrorNotification({
      title = this.$t('orgs.error'),
      description = this.$t('orgs.save_error'),
      scheme = 'feedback-red',
    } = {}) {
      this.$store.dispatch('openModal', {
        type: 'alert',
        data: {
          icon: 'alert-circle-1',
          scheme,
          title,
          description,
        },
      });
    },

    handleAddMemberError(error) {
      console.error(error);

      if (_.get(error, 'response.data.detail')) {
        this.showErrorNotification({
          scheme: 'feedback-yellow',
          description: _.get(error, 'response.data.detail'),
        });
      } else {
        this.showErrorNotification();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.weni-org-permissions {
  display: flex;
  flex-direction: column;

  :deep(.unnnic-form-input .unnnic-tooltip) {
    z-index: 5;

    .unnnic-tooltip-label-bottom::after {
      bottom: 98%;
    }
  }
}
</style>
