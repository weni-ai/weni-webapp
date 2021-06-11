<template>
    <div v-show="!loading" class="weni-org-permissions">
      <user-management
        :label-role="$t('orgs.create.permission')"
        :label-email="$t('orgs.create.user_search_description')"
        tooltip-side-icon-right="bottom"
        :users="users"
        @users="users = $event"
        :changes="changes"
        @changes="changes = $event"
        :style="{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }"
        @fetch-permissions="fetchPermissions"
        :org="org"
        :already-added-text="$t('orgs.users.already_in')"
        @finish="$emit('finish')"
      ></user-management>

      <div class="weni-org-permissions__separator" />

      <unnnic-button
        :disabled="loading || noChanges()"
        class="weni-org-permissions__button"
        type="secondary"
        @click="saveChanges"
      >
        {{ $t('orgs.save') }}
      </unnnic-button>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { unnnicCallModal } from '@weni/unnnic-system';
import UserManagement from './UserManagement.vue';
import _ from 'lodash';
import orgs from '../../api/orgs';

export default {
  name: 'OrgPermissions',

  components: {
    UserManagement,
  },

  props: {
    org: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      page: 1,
      complete: false,
      error: false,
      users: [],
      changes: {},
    };
  },

  watch:{
    loading(){
      this.$emit('isLoading', this.loading)
    }
  },

  methods: {
    ...mapActions([
      'getMembers',
      'changeAuthorization',
    ]),

    async fetchPermissions($state) {
       try {
        this.loading=true;
        const response = await this.getMembers({ uuid: this.org.uuid, page: this.page });
        this.page = this.page + 1;
        this.users = [...this.users, ...response.data.results.map(user => ({
          id: user.user__id,
          uuid: user.uuid,
          name: user.user__username,
          email: user.user__email,
          photo: user.user__photo,
          role: user.role,
          username: user.user__username,
        }))];
        this.complete = response.data.next == null;

        const { data } = await orgs.listRequestPermission({ organization: this.org.uuid, page: 1 });

        this.users = this.users.concat(data.results.map((user) => ({
          id: user.id,
          uuid: Math.random(),
          name: user.email,
          email: user.email,
          photo: null,
          role: user.role,
          username: user.email,
          status: 'pending',
          disabledRole: true,
        })));
      } catch(e) {
        $state.error();
      } finally {
        this.loading=false;
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },
    noChanges() {
      return Object.values(this.changes).length === 0;
    },
    async saveChanges() {
      const changes = Object.values(this.changes).map(
        async (change) => {
          if (change.offline) {
            const organizationUuid = _.get(this.org, 'uuid');

            return orgs.createRequestPermission({
              organization: organizationUuid,
              email: change.email,
              role: change.role,
            });
          } else {
            return this.changeRole(change.role, change.id);
          }
      });
      this.loading = true;
      await Promise.all(changes);
      this.loading = false;

      if (!this.error) {
        this.$root.$emit('open-modal', {
          type: 'alert',
          data: {
            type: 'success',
            title: this.$t('orgs.saved_changes'),
            description: this.$t('orgs.saved_changes_description'),
          },
        });
      } else {
        unnnicCallModal({
          props: {
            text: this.$t('orgs.error'),
            description: this.$t('orgs.save_error'),
            scheme: 'feedback-red',
            icon: 'check-circle-1',
          },
        });
      }

      if (!this.error) {
        this.$emit('finish');
      }

      this.error = false;
    },
    async changeRole(role, id) {
      try {
        await this.changeAuthorization({
          orgId: this.org.uuid,
          username: id,
          role,
        });
      } catch(e) {
        this.error = true;
      }
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

    &__separator {
      border: 1px solid $unnnic-color-neutral-soft;
      margin: $unnnic-spacing-stack-md 0;
    }

    &__button {
      width: 100%;
    }
  }
</style>
