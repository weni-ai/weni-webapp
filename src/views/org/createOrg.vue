<template>
  <container-condensed class="weni-create-org" :center="current === 3">
    <unnnic-indicator
      class="weni-create-org__indicator"
      :number-of-steps="steps.length"
      :current-step="current + 1"
      :titles="steps"
    />

    <div v-show="current === 0" class="weni-create-org__section">
      <div class="title">
        {{ $t('orgs.create.organization_title') }}
      </div>

      <div helphero="creating-the-organization">
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
      </div>

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
      <div class="subtitle">{{ $t('orgs.add_info') }}</div>
      <user-management
        type="manage"
        v-model="users"
        do-not-fetch
        cannot-delete-my-user
        :style="{
          display: 'flex',
          flexDirection: 'column',
        }"
        :already-added-text="$t('orgs.users.already_added')"
        offline
        helphero="inviting-members"
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

      <div helphero="creating-project" class="creating-project">
        <unnnic-input-next
          :value="projectName"
          @input="
            projectName = $event;
            errors.projectName = false;
          "
          :label="$t('orgs.create.project_name')"
          :placeholder="$t('orgs.create.project_name_placeholder')"
          :error="errors.projectName"
          ref="projectName"
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

        <project-format-control
          :type="projectFormat"
          @change="
            projectFormat = $event;
            errors.projectFormat = false;
          "
          :setup.sync="setupFields"
          :error="errors.projectFormat"
          ref="projectFormat"
        />
      </div>

      <div class="weni-create-org__group weni-create-org__group__buttons">
        <unnnic-button
          type="terciary"
          :disabled="creatingOrg"
          @click="backBilling"
        >
          {{ $t('orgs.create.back') }}
        </unnnic-button>
        <unnnic-button
          :disabled="!canProgress"
          :loading="creatingOrg"
          type="secondary"
          @click="finish"
        >
          {{ $t('orgs.create.done') }}
        </unnnic-button>
      </div>
    </div>

    <div v-show="current === 3" class="success-page">
      <div class="title">
        {{ $t('orgs.create.finish_text') }}
        😉
      </div>

      <div class="buttons">
        <unnnic-button
          type="terciary"
          @click="
            $router.push({
              name: 'projects',
              params: { orgUuid: currentOrg.uuid },
            })
          "
        >
          {{ $t('projects.create.view_projects') }}
        </unnnic-button>

        <unnnic-button
          type="secondary"
          @click="
            $router.push({
              name: 'home',
              params: { projectUuid: currentProject.uuid },
            })
          "
        >
          {{ $t('orgs.create.go_to_org') }}
        </unnnic-button>
      </div>
    </div>
  </container-condensed>
</template>

<script>
import UserManagement from '../../components/orgs/UserManagement.vue';
import timezones from '../projects/timezone';
import { mapActions, mapGetters, mapState } from 'vuex';
import ProjectFormatControl from '../projects/ProjectFormatControl.vue';
import { ORG_ROLE_ADMIN } from '../../components/orgs/orgListItem.vue';
import ContainerCondensed from '../../components/ContainerCondensed.vue';
import { captureException } from '@sentry/browser';

export default {
  name: 'CreateOrg',
  components: {
    UserManagement,
    ProjectFormatControl,
    ContainerCondensed,
  },

  mixins: [timezones],

  data() {
    return {
      creatingOrg: false,
      org: null,
      project: null,
      error: null,
      errors: {
        projectName: false,
        projectFormat: false,
      },
      orgError: null,
      orgName: null,
      orgDescription: null,
      projectName: null,
      dateFormat: 'D',
      timeZone: 'America/Argentina/Buenos_Aires',
      projectFormat: null,
      users: [],
      setupFields: {},
    };
  },
  computed: {
    ...mapState({
      current: (state) => state.BillingSteps.current,
    }),

    ...mapGetters(['currentOrg', 'currentProject']),

    steps() {
      return ['organization', 'members', 'project'].map((name) =>
        this.$t(`orgs.create.${name}`),
      );
    },
    canProgress() {
      if (this.current === 0) {
        return [this.orgName, this.orgDescription].every(
          (field) => field && field.length > 0,
        );
      }

      return true;
    },
  },

  created() {
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
        role: ORG_ROLE_ADMIN,
        username: user.username,
      },
    ];

    this.resetBillingSteps();

    // this.$store.state.BillingSteps.current = 3;
  },

  watch: {
    '$route.query': {
      immediate: true,
      deep: true,

      handler() {
        if (
          !this.$route.query?.plan ||
          !['trial', 'start', 'scale', 'advanced', 'enterprise'].includes(
            this.$route.query?.plan,
          )
        ) {
          this.$router.replace({
            name: 'create_org',
            query: {
              plan: 'trial',
            },
          });
        }
      },
    },
  },

  methods: {
    ...mapActions([
      'openModal',
      'setBillingOrgStep',
      'setBillingMembersStep',
      'setBillingProjectStep',
      'backBilling',
      'resetBillingSteps',
      'getOrg',
      'setCurrentOrg',
      'createOrg',
    ]),

    async finish() {
      const canFinish = [
        this.projectName,
        this.dateFormat,
        this.timeZone,
        this.projectFormat,
      ].every((field) => field && field.length > 0);

      if (!canFinish) {
        ['projectFormat', 'projectName'].forEach((fieldName) => {
          if (!this[fieldName]) {
            this.$refs[fieldName].$el.scrollIntoView({
              behavior: 'smooth',
              inline: 'nearest',
            });
            this.errors[fieldName] = this.$t('errors.required');
          }
        });

        return;
      }

      this.setBillingProjectStep({
        name: this.projectName,
        dateFormat: this.dateFormat,
        timeZone: this.timeZone,
        format: this.projectFormat,
        globals: this.setupFields,
      });

      try {
        this.creatingOrg = true;

        const authorizations = this.users
          .filter(
            ({ email }) => email !== this.$store.state.Account.profile.email,
          )
          .map(({ email, role }) => ({
            user_email: email,
            role,
          }));

        await this.createOrg({
          type: this.$route.query.plan,
          stripeCustomer:
            this.$store.state.BillingSteps.billing_details.customer,
          authorizations,
        });

        this.$store.state.BillingSteps.current = 3;
      } catch (error) {
        let message = null;

        if (error?.response?.data?.message) {
          message = error?.response?.data?.message;
        } else if (error?.response?.data instanceof Array) {
          message = error?.response?.data.join(', ');
        }

        if (message) {
          this.openServerErrorAlertModal({
            description: message,
          });
        }

        captureException(new Error('ORG_CREATE', { cause: error }));
      } finally {
        this.creatingOrg = false;
      }
    },

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

        return this.$router.push({
          name: 'orgs',
        });
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
            this.$router.push({
              name: 'orgs',
            });
          },
        },
      });
    },
    onProceedPermissions() {
      this.setBillingMembersStep({
        users: this.users,
      });
    },

    sleep(seconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1e3);
      });
    },

    async reloadCurrentOrg(secondsDelay = 0) {
      await this.sleep(secondsDelay);

      try {
        const { data: org } = await this.getOrg({
          uuid: this.currentOrg.uuid,
        });

        this.setCurrentOrg(org);
      } catch (error) {
        this.$router.push({ name: 'orgs' });
      }
    },
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
  margin-bottom: $unnnic-spacing-stack-xs;
}

.weni-create-org__name-input {
  margin-bottom: $unnnic-spacing-stack-md;
}

.creating-project .unnnic-select ::v-deep .unnnic-form__label {
  margin-top: $unnnic-spacing-stack-md;
}

.subtitle {
  color: $unnnic-color-neutral-cloudy;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  text-align: center;
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

  .success-page {
    .buttons {
      column-gap: $unnnic-spacing-inline-sm;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
