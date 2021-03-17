<template>
    <div class="weni-create-org">
        <indicator class="weni-create-org__indicator" :steps="steps.length" :current="current+1" :names="steps" />
        <div v-show="current===0" class="weni-create-org__section">
            <unnnic-input
              v-model="orgName"
              :label="$t('orgs.create.org_name')"
              :placeholder="$t('orgs.create.org_name_placeholder')"/>
            <unnnic-input
              v-model="orgDescription"
              :label="$t('orgs.create.org_description')"
              :placeholder="$t('orgs.create.org_description_placeholder')" />
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button @click="back()" type="terciary"> {{ $t('orgs.create.back') }} </unnnic-button>
              <unnnic-button
                :disabled="!canProgress"
                type="secondary"
                @click="current = current + 1">
                {{ $t('orgs.create.next') }}
              </unnnic-button>
            </div>
        </div>
        <div v-show="current===1" class="weni-create-org__section">
            <h1> {{ $t('orgs.create.title') }} </h1>
            <div class="weni-create-org__group">
              <search-user
                v-model="userSearch"
                class="weni-create-org__email-input"
                :type="userError ? 'error' : 'normal'"
                :message="userError"
                :label="$t('orgs.create.org_user_email')"
                :placeholder="$t('orgs.create.org_user_email_placeholder')"
                icon-right="keyboard-return-1"
                @select="onSelect($event)"
                @enter="onEnterUser"
                @input="userError = null"/>
              <org-permission-select
                v-model="role"
                :label="$t('orgs.create.permission')"/>
            </div>
            <div class="weni-create-org__users">
              <org-role
                disabled
                :role="3"
                :can-delete="false"
                email="email"
                :name="$t('orgs.you')"/>
              <org-role
                v-for="(user, index) in users"
                :key="index"
                :name="user.username"
                :email="user.username"
                :role="user.role"
                @onChangeRole="onEdit($event, user)"
                @onDelete="onRemove(user.username)"/>
            </div>
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary" @click="current = current - 1"> {{ $t('orgs.create.back') }} </unnnic-button>
              <unnnic-button type="secondary" @click="onProceedPermissions()"> {{ $t('orgs.create.next') }} </unnnic-button>
            </div>
        </div>
        <div v-show="current===2" class="weni-create-org__section">
            <unnnic-input
              v-model="projectName"
              :label="$t('orgs.create.project_name')"
              :placeholder="$t('orgs.create.project_name_placeholder')"/>
            <unnnic-select
              v-model="dateFormat"
              :label="$t('orgs.create.date_format')">
              <option value="D"> DD-MM-YYYY </option>
              <option value="M"> MM-DD-YYYY </option>
            </unnnic-select>
            <!-- <unnnic-select :label="$t('orgs.create.time_zone')" /> -->
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary" :disabled="loading" @click="current = current - 1"> {{ $t('orgs.create.back') }} </unnnic-button>
              <unnnic-button
                :disabled="!canProgress"
                type="secondary"
                @click="onSubmit()"> {{ $t('orgs.create.next') }} </unnnic-button>
            </div>
        </div>
        <div v-show="current===3" class="weni-create-org__section">
            <h1> {{ $t('orgs.create.finish_text') }} </h1>
            <p
              class="weni-create-org__error"
              v-if="error"> {{ $t('orgs.create.save_error') }} </p>
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button @click="onFinish()" type="secondary"> {{ $t('orgs.create.go_to_org') }} </unnnic-button>
            </div>
        </div>
        <confirm-modal
          :open="confirmPermissions"
          type="alert"
          :title="this.$t('orgs.create.no_permission_title')"
          :description="this.$t('orgs.create.no_permission')"
          :confirmText="this.$t('orgs.create.no_permission_confirm')"
          :cancelText="$t('cancel')"
          @close="confirmPermissions = false"
          @confirm="confirmPermissions = false; current = current + 1;"
        />
        <footer></footer>
    </div>
</template>

<script>
import Indicator from '../../components/orgs/indicator';
import OrgRole from '../../components/orgs/orgRole';
import SearchUser from '../../components/orgs/searchUser';
import OrgPermissionSelect from '../../components/orgs/orgPermissionSelect';
import ConfirmModal from '../../components/ConfirmModal';
import {
  unnnicInput,
  unnnicButton,
  unnnicSelect,
  unnnicCallAlert 
} from 'unnic-system-beta';
import { mapActions, mapMutations } from 'vuex';

export default {
  name: 'CreateOrg',
  components: {
    Indicator,
    unnnicInput,
    unnnicButton,
    unnnicSelect,
    OrgRole,
    SearchUser,
    OrgPermissionSelect,
    ConfirmModal,
  },
  data() {
    return {
      current: 0,
      loading: false,
      user: null,
      userSearch: null,
      role: null,
      roles: {},
      userError: null,
      confirmPermissions: false,
      orgId: null,
      error: null,
      orgError: null,
      orgName: null,
      orgDescription: null,
      projectName: null,
      dateFormat: null,
      timeZone: null,
    };
  },
  computed: {
    users() {
      return Object.values(this.roles);
    },
    steps() {
      return ["organization", "members", "project"].map((name) => this.$t(`orgs.create.${name}`));
    },
    canProgress() {
      if(this.current === 0) {
        return [this.orgName, this.orgDescription].every((field) => field && field.length > 0);
      }
      if (this.current === 1) return true;
      if (this.current === 2) {
        return [this.projectName, this.dateFormat].every((field) => field && field.length > 0);
      }
      return true;
    },
  },
  methods: {
    ...mapMutations([
      'setCurrentOrgId',
    ]),
    ...mapActions([
      'createOrg', 'changeAuthorization', 'createProject',
    ]),
    back() {
      this.luigiClient.linkManager().navigate('/home/index');
    },
    onProceedPermissions() {
      if (this.users.length === 0) {
        this.confirmPermissions = true;
      }
      else { this.current = this.current + 1; }
    },
    onSelect(user) {
      this.user = user;
    },
    async onEnterUser() {
      if (!this.role || !this.user) {
        this.userError = this.$t('orgs.invalid_email');
        return;
      }
      this.$set(this.roles, this.user.username, { 
        username: this.user.username,
        role: this.role,
      });
      this.role = null;
      this.user = null;
      this.userSearch = null;
    },
    onEdit(role, user) {
      this.$set(this.roles, user.username, { 
        username: user.username,
        role: role,
      });
    },
    onRemove(username) {
      delete this.roles[username];
    },
    async onCreateOrg() {
      try {
          const response = await this.createOrg({
          name: this.orgName,
          description: this.orgDescription,
        });
        this.orgId = response.data.uuid;
      } catch (e) {
        console.log(e);
        this.orgError = e;
      }
    },
    async onMakeChanges() {
      var changes = Object.values(this.roles).map(
        async (change) => {
          try {
            await this.changeAuthorization({
              orgId: this.orgId,
              username: change.username,
              role: change.role,
            });
          } catch(e) {
            console.log(e);
            this.error = true;
          }
      });
      const createProject = async () => {
          try {
            await this.createProject({
              orgId: this.orgId,
              name: this.projectName,
              dateFormat: this.dateFormat,
            });
          } catch (e) {
            console.log(e);
            this.error = true;
          }
        }
      changes = [
        ...changes,
        createProject(),
      ];
      await Promise.all(changes);
    },
    async onSubmit() {
      this.loading = true;
      await this.onCreateOrg();
      if (this.orgError) {
        unnnicCallAlert({ props: {
          text: this.$t('orgs.create.org_error'),
          title: 'Error',
          icon: 'check-circle-1-1',
          scheme: 'feedback-red',
          position: 'bottom-right',
          closeText: this.$t('close'),
        }, seconds: 3 });
        this.orgError = null;
      } else {
        await this.onMakeChanges();
        this.current = this.current + 1;
      }
      this.loading = false;
    },
    onFinish() {
      this.setCurrentOrgId(this.orgId);
      this.luigiClient.linkManager().navigate('/home/index');
    },
  },
}
</script>

<style lang="scss" >
 @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  .weni-create-org {
    max-width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: auto;
    padding: 2.5rem 0 0 0;
    height: 100vh;
    box-sizing: border-box;

    h1 {
      font-size: $unnnic-font-size-title-md;
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-regular;
      margin: 0 0 $unnnic-spacing-stack-md 0;
      text-align: center;
    }

    &__error {
      font-family: $unnnic-font-family-secondary;
      text-align: center;
    }

    &__users {
        max-height: 4*60px;
        overflow-y: auto;
        margin: $unnnic-spacing-stack-md 0 0 0;
        > *:not(:last-child) {
          margin: 0 0 1.25rem 0;
      }
    }

    &__indicator {
      margin-bottom: 22px + 40px;
      max-width: 50%;
    }

    &__email-input {
      flex: 1;
    }

    &__group {
      display: flex;
      > *:not(:last-child) {
        margin-right: $unnnic-spacing-stack-sm;
      }

      &__buttons {
        margin-top: $unnnic-spacing-stack-md;
        > * {
          flex: 1;
        }
      }
    }

    &__section {
      width: 100%;
    }

    footer {
      flex: 1;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      &::before {
        content: '';
        height: 8px;
        display: block;
        background-color: $unnnic-color-brand-weni;
      }
    }
  }
</style>