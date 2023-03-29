<template>
  <div class="weni-org-permissions">
    <user-management
      :type="type"
      v-model="users"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }"
      :search-name.sync="searchName"
      :org="org"
      :already-added-text="$t('orgs.users.already_in')"
      :loading="loadingAddMember"
      @fetch-permissions="fetchPermissions"
      @reset="resetFetch"
      @add="addMember"
      @remove-user="removeUser"
      @change-role="changeRole"
      @finish="$emit('finish')"
    ></user-management>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { unnnicCallAlert } from '@weni/unnnic-system';
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
    ...mapActions(['getMembers', 'changeAuthorization', 'openModal']),

    resetFetch() {
      this.users = [];
      this.page = 0;
      this.complete = false;

      this.fetchPermissions();
    },

    async fetchPermissions($state) {
      try {
        this.loading = true;
        const response = await this.getMembers({
          uuid: this.org.uuid,
          page: this.page,
          search: this.searchName,
        });
        this.page = this.page + 1;
        this.users = [
          ...this.users,
          ...response.data.results.map((user) => ({
            id: user.user__id,
            uuid: user.uuid,
            name: user.user__username,
            email: user.user__email,
            photo: user.user__photo,
            role: user.role,
            username: user.user__username,
          })),
        ];
        this.complete = response.data.next == null;

        const { data } = await orgs.listRequestPermission({
          organization: this.org.uuid,
          page: 1,
        });

        this.users = this.users.concat(
          data.results.map((user) => ({
            id: user.id,
            uuid: Math.random(),
            name: user.email,
            email: user.email,
            photo: null,
            role: user.role,
            username: user.email,
            status: 'pending',
            disabledRole: true,
          })),
        );
      } catch (e) {
        $state.error();
      } finally {
        this.loading = false;
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },

    removeUser(username) {
      if (this.$store.state.Account.profile.username === username) {
        this.$store.state.Org.orgs.data =
          this.$store.state.Org.orgs.data.filter(
            (org) => org.uuid !== this.orgUuid,
          );

        this.$emit('close');
      } else {
        this.org.authorizations.users = this.org.authorizations.users.filter(
          (user) => user.username !== username,
        );
      }
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

        if (member.status === 'pending') {
          member.id = response.data.id;
        } else {
          const [first_name, last_name] =
            response.data.user_data.name.split(' ');

          this.org.authorizations.users.push({
            username: member.username,
            first_name,
            last_name,
            role: response.data.role,
            photo_user: response.data.user_data.photo,
          });
        }

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
      } catch (error) {
        if (_.get(error, 'response.data.detail')) {
          this.$store.dispatch('openModal', {
            type: 'alert',
            data: {
              icon: 'alert-circle-1',
              scheme: 'feedback-yellow',
              title: this.$t('orgs.save_error'),
              description: _.get(error, 'response.data.detail'),
            },
          });
        } else {
          this.genericError();
        }
      }

      this.loadingAddMember = false;
    },

    async changeRole({ id, role }) {
      try {
        await this.changeAuthorization({
          orgId: this.org.uuid,
          username: id,
          role,
        });

        unnnicCallAlert({
          props: {
            text: this.$t('orgs.saved_changes_description'),
            title: this.$t('orgs.saved_changes'),
            icon: 'check-circle-1-1',
            scheme: 'feedback-green',
            position: 'bottom-right',
            closeText: this.$t('close'),
          },
          seconds: 3,
        });
      } catch (error) {
        this.genericError();
      }
    },

    genericError({
      title = this.$t('orgs.error'),
      description = this.$t('orgs.save_error'),
    } = {}) {
      this.$store.dispatch('openModal', {
        type: 'alert',
        data: {
          icon: 'alert-circle-1',
          scheme: 'feedback-red',
          title,
          description,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.weni-org-permissions {
  display: flex;
  flex-direction: column;

  ::v-deep .unnnic-form-input .unnnic-tooltip {
    z-index: 5;

    .unnnic-tooltip-label-bottom::after {
      bottom: 98%;
    }
  }
}
</style>
