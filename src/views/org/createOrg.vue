<template>
  <container class="weni-create-org" :center="current === 3">
    <indicator
      class="weni-create-org__indicator"
      :steps="steps.length"
      :current="current + 1"
      :names="steps"
    />

    <div v-show="current === 0" class="weni-create-org__section">
      <div class="title">
        {{ $t('orgs.create.organization_title') }}
      </div>

      <unnnic-input
        class="weni-create-org__name-input"
        v-model="orgName"
        :label="$t('orgs.create.org_name')"
        :placeholder="$t('orgs.create.org_name_placeholder')"
      />
      <unnnic-input
        v-model="orgDescription"
        :label="$t('orgs.create.org_description')"
        :placeholder="$t('orgs.create.org_description_placeholder')"
      />
      <div class="weni-create-org__group weni-create-org__group__buttons">
        <unnnic-button @click="back" type="terciary">
          {{ $t('orgs.create.back') }}
        </unnnic-button>
        <unnnic-button
          :disabled="!canProgress"
          type="secondary"
          @click="
            setBillingOrgStep({ name: orgName, description: orgDescription })
          "
        >
          {{ $t('orgs.create.next') }}
        </unnnic-button>
      </div>
    </div>
    <div v-show="current === 1" class="weni-create-org__section">
      <div class="title">
        {{ $t('orgs.create.title') }}
      </div>

      <user-management
        :label-role="$t('orgs.create.permission')"
        :label-email="$t('orgs.create.org_user_email')"
        do-not-fetch
        cannot-delete-my-user
        tooltip-side-icon-right="right"
        :users="users"
        @users="users = $event"
        :changes="userChanges"
        @changes="userChanges = $event"
        :style="{
          display: 'flex',
          flexDirection: 'column',
        }"
        :already-added-text="$t('orgs.users.already_added')"
      ></user-management>

      <div class="weni-create-org__group weni-create-org__group__buttons">
        <unnnic-button type="terciary" @click="backBilling">
          {{ $t('orgs.create.back') }}
        </unnnic-button>
        <unnnic-button type="secondary" @click="onProceedPermissions()">
          {{ $t('orgs.create.next') }}
        </unnnic-button>
      </div>
    </div>
    <div v-show="current === 2" class="weni-create-org__section">
      <div class="title">
        {{ $t('orgs.create.project_title') }}
      </div>

      <unnnic-input
        v-model="projectName"
        :label="$t('orgs.create.project_name')"
        :placeholder="$t('orgs.create.project_name_placeholder')"
      />
      <unnnic-select
        v-model="dateFormat"
        :label="$t('orgs.create.date_format')"
      >
        <option value="D">DD-MM-YYYY</option>
        <option value="M">MM-DD-YYYY</option>
      </unnnic-select>

      <unnnic-select
        v-model="timeZone"
        :label="$t('orgs.create.time_zone')"
        search
        :search-placeholder="$t('orgs.create.timezone_search_placeholder')"
      >
        <option
          v-for="timezone in timezones"
          :key="timezone.zoneName"
          :value="timezone.zoneName"
        >
          {{ timezone }}
        </option>
      </unnnic-select>

      <div class="weni-create-org__group weni-create-org__group__buttons">
        <unnnic-button type="terciary" :disabled="loading" @click="backBilling">
          {{ $t('orgs.create.back') }}
        </unnnic-button>
        <unnnic-button
          :disabled="!canProgress"
          :loading="loading"
          type="secondary"
          @click="
            setBillingProjectStep({ name: projectName, dateFormat, timeZone })
          "
        >
          {{ $t('orgs.create.done') }}
        </unnnic-button>
      </div>
    </div>
    <div v-if="current === 3">
      <BillingCreateOrg />
    </div>
  </container>
</template>

<script>
import Indicator from '../../components/orgs/indicator';
import UserManagement from '../../components/orgs/UserManagement.vue';
import timezones from '../projects/timezone';
import container from '../projects/container';
import BillingCreateOrg from '@/views/billing/createOrg.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'CreateOrg',
  components: {
    Indicator,
    UserManagement,
    container,
    BillingCreateOrg,
  },

  mixins: [timezones],

  data() {
    return {
      loading: false,
      org: null,
      project: null,
      error: null,
      orgError: null,
      orgName: null,
      orgDescription: null,
      projectName: null,
      dateFormat: 'D',
      timeZone: 'America/Argentina/Buenos_Aires',
      users: [],
      userChanges: {},
    };
  },
  computed: {
    ...mapState({
      current: (state) => state.BillingSteps.current,
      // users: (state) => state.BillingSteps.users,
    }),
    steps() {
      return ['organization', 'members', 'project'].map((name) =>
        this.$t(`orgs.create.${name}`),
      );
    },
    canProgress() {
      console.log(this.current);
      if (this.current === 0) {
        return [this.orgName, this.orgDescription].every(
          (field) => field && field.length > 0,
        );
      }
      if (this.current === 1) return true;
      if (this.current === 2) {
        return [this.projectName, this.dateFormat, this.timeZone].every(
          (field) => field && field.length > 0,
        );
      }
      return true;
    },
  },

  created() {
    const ROLE_ADMIN = '3';
    const user = this.$store.state.Account.profile;

    this.users = [
      {
        id: user.id,
        uuid: null,
        name: [user.first_name, user.last_name]
          .filter((name) => name)
          .join(' '),
        email: user.email,
        photo: user.photo,
        role: ROLE_ADMIN,
        username: user.username,
      },
    ];

    this.resetBillingSteps();
  },

  methods: {
    ...mapActions([
      'openModal',
      'setBillingOrgStep',
      'setBillingMembersStep',
      'setBillingProjectStep',
      'backBilling',
      'resetBillingSteps',
    ]),

    openServerErrorAlertModal({
      title = this.$t('alerts.server_problem.title'),
      description = this.$t('alerts.server_problem.description'),
    } = {}) {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'alert-circle-1',
          scheme: 'feedback-yellow',
          title,
          description,
        },
      });
    },

    back() {
      if (
        !this.orgName &&
        !this.orgDescription &&
        !this.projectName &&
        this.users.length === 1
      ) {
        this.backBilling();

        return this.$router.push('/orgs');
      }
      this.openModal({
        type: 'confirm',
        data: {
          persistent: true,
          icon: 'alert-circle-1',
          scheme: 'feedback-yellow',
          title: this.$t('orgs.create.exit_org_creation'),
          description: this.$t('orgs.create.exit_org_creation_description'),
          cancelText: this.$t('cancel'),
          confirmText: this.$t('orgs.create.no_permission_confirm'),
          onConfirm: (justClose) => {
            justClose();
            this.backBilling();
            this.$router.push('/orgs');
          },
        },
      });
    },
    onProceedPermissions() {
      if (this.users.length === 1) {
        this.openModal({
          type: 'confirm',
          data: {
            persistent: true,
            icon: 'alert-circle-1',
            scheme: 'feedback-yellow',
            title: this.$t('orgs.create.no_permission_title'),
            description: this.$t('orgs.create.no_permission'),
            cancelText: this.$t('cancel'),
            confirmText: this.$t('orgs.create.no_permission_confirm'),
            onConfirm: (justClose) => {
              justClose();
              this.setBillingMembersStep({
                users: this.users,
                userChanges: this.userChanges,
              });
            },
          },
        });
      } else {
        this.setBillingMembersStep({
          users: this.users,
          userChanges: this.userChanges,
        });
      }
    },

    /*
    async onCreateOrg() {
      try {
        const response = await this.createOrg({
          name: this.orgName,
          description: this.orgDescription,
        });
        this.org = response.data;
      } catch (e) {
        console.log(e);
        this.orgError = e;
      }
    },
    */
    /*
    async onMakeChanges() {
      var changes = Object.values(this.userChanges).map(async (change) => {
        try {
          const organizationUuid = _.get(this.org, 'uuid');

          await orgs.createRequestPermission({
            organization: organizationUuid,
            email: change.email,
            role: change.role,
          });
        } catch (e) {
          console.log(e);
          this.error = true;
        }
      });
      const createProject = async () => {
        try {
          const response = await this.createProject({
            orgId: this.org.uuid,
            name: this.projectName,
            dateFormat: this.dateFormat,
            timezone: this.timeZone,
          });

          this.project = response.data;
        } catch (e) {
          this.setCurrentOrg(this.org);

          this.$router.push({
            name: 'projects',
            params: {
              orgUuid: this.org.uuid,
            },
          });

          unnnicCallAlert({
            props: {
              icon: 'alert-circle-1-1',
              scheme: 'feedback-yellow',
              text: this.$t('projects.create.error'),
              title: '',
              position: 'bottom-right',
              closeText: this.$t('close'),
            },
            seconds: 3,
          });
        }
      };
      changes = [...changes, createProject()];
      await Promise.all(changes);
    },
    */
    /*
    async onSubmit() {
      this.loading = true;
      await this.onCreateOrg();

      if (this.orgError) {
        this.openServerErrorAlertModal();
        this.orgError = null;
      } else {
        await this.onMakeChanges();
        this.current = this.current + 1;
      }
      this.loading = false;
    },
    */
    /*
    viewProjects() {
      this.setCurrentOrg(this.org);

      this.$router.push({
        name: 'projects',
        params: {
          orgUuid: this.org.uuid,
        },
      });
    },
    */
    /*
    onFinish() {
      this.setCurrentOrg(this.org);

      const project = {
        ...this.project,
        organization: {
          uuid: this.project.organization,
        },
        flow_organization: {
          uuid: this.project.flow_organization,
        },
        menu: this.project.menu,
      };

      this.setCurrentProject(project);

      this.$router.push({
        name: 'home',
        params: {
          projectUuid: project.uuid,
        },
      });
      this.$root.$emit('set-sidebar-expanded');
    },
    */
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.title {
  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-primary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-title-md;
  line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
  text-align: center;
  margin-bottom: $unnnic-spacing-stack-md;
}

.weni-create-org__name-input {
  margin-bottom: $unnnic-spacing-stack-md;
}
</style>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.weni-create-org {
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

  &__indicator {
    margin: 0 auto;
    margin-bottom: 22px + 40px;
    max-width: 50%;
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
}
</style>
