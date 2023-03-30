<template>
  <div class="unnnic-grid-span-6 quick-access">
    <unnnic-card
      type="title"
      icon="flash-1-3"
      :title="$t('home.quick_access.title')"
      info-position="left"
      scheme="aux-orange"
      :info="$t('home.quick_access.info')"
    />

    <div class="options">
      <div class="u bg-neutral-snow">
        <div class="u font body-gt bold color-neutral-darkest">
          {{ $t('home.quick_access.add_channel.title') }}
        </div>

        <div class="channels">
          <router-link :to="appLink('wpp-demo')">
            <img src="@/assets/logos/whatsapp-demo.svg" />
          </router-link>

          <router-link :to="appLink('tg')">
            <img src="@/assets/logos/telegram.svg" />
          </router-link>

          <router-link :to="appLink('wwc')">
            <img src="@/assets/logos/weni-webchat.svg" />
          </router-link>
        </div>

        <unnnic-button
          type="terciary"
          size="small"
          icon-left="add-1"
          @click="
            $router.push({
              name: 'integrations',
              params: { internal: ['r', 'apps', 'discovery'] },
            })
          "
        >
          {{ $t('home.quick_access.add_channel.button') }}
        </unnnic-button>
      </div>

      <div class="u bg-neutral-snow">
        <div class="u font body-gt bold color-neutral-darkest">
          {{ $t('home.quick_access.invite_member.title') }}
        </div>

        <unnnic-input
          ref="email"
          v-model="email"
          class="invite-input"
          :placeholder="$t('home.quick_access.invite_member.placeholder')"
          size="sm"
          @keypress.enter="addAuthorization"
          :disabled="addingAuthorization"
        ></unnnic-input>

        <unnnic-button
          type="terciary"
          size="small"
          @click="addAuthorization"
          :loading="addingAuthorization"
        >
          {{ $t('home.quick_access.invite_member.button') }}
        </unnnic-button>
      </div>
    </div>

    <unnnic-card
      type="title"
      icon="study-light-idea-1"
      :title="$t('home.quick_access.lastest_activities.title')"
      info-position="left"
      scheme="aux-pink"
      :info="$t('home.quick_access.lastest_activities.info')"
    />

    <div class="lastest-activities u bg-neutral-snow">
      <div :style="{ flex: 1, position: 'relative' }">
        <div class="content">
          <div v-for="(activity, index) in activities" :key="index">
            <span
              class="u font secondary body-md color-neutral-darkest"
              v-html="
                $t(
                  `home.quick_access.lastest_activities.actions.${activity.action}`,
                  activity,
                )
              "
            ></span>

            <span
              class="u font secondary body-sm color-neutral-cloudy upper-case"
            >
              {{ fromNow(activity.created_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import projects from '../../api/projects';
import { PROJECT_ROLE_CONTRIBUTOR } from '../../components/users/permissionsObjects';
import {
  openServerErrorAlertModal,
  openAlertModal,
} from '../../utils/openServerErrorAlertModal';

export default {
  data() {
    return {
      email: '',
      addingAuthorization: false,

      activities: [],
    };
  },

  created() {
    projects
      .latestActivities({
        projectUuid: this.$store.getters.currentProject.uuid,
      })
      .then(({ data }) => {
        this.activities = data
          .filter(({ action }) =>
            [
              'created-ai',
              'trained-ai',
              'integrated-ai',
              'edited-channel',
              'created-channel',
              'joined-project',
              'created-flow',
              'edited-flow',
              'created-campaign',
              'edited-campaign',
              'created-trigger',
              'edited-trigger',
            ].includes(action),
          )
          .filter(
            ({ action, name }) =>
              !(action === 'edited-channel' && name?.startsWith?.('WhatsApp')),
          );
      });
  },

  methods: {
    fromNow(date) {
      moment.locale(this.$i18n.locale);
      return moment(date).fromNow();
    },

    appLink(name) {
      return {
        name: 'integrations',
        params: {
          internal: `r/apps/discovery?create_app=${name}`
            // .replace(/\?/g, '%3F')
            .split('/'),
        },
      };
    },

    async addAuthorization() {
      const email = this.email.trim();

      if (!email) {
        this.$refs.email.$el.querySelector('input').focus();
        return;
      }

      try {
        this.addingAuthorization = true;

        const response = await projects.createProjectAuthorization({
          email,
          projectUuid: this.$store.getters.currentProject.uuid,
          role: PROJECT_ROLE_CONTRIBUTOR,
        });

        if (response?.data?.status !== 200) {
          throw response;
        }

        this.email = '';

        openAlertModal({
          type: 'success',
          title: this.$t('home.quick_access.invite_member.alerts.added.title'),
          description: this.$t(
            'home.quick_access.invite_member.alerts.added.description',
          ),
        });
      } catch (error) {
        openServerErrorAlertModal({
          description: error?.data?.message || undefined,
        });
      } finally {
        this.addingAuthorization = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.quick-access {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  row-gap: $unnnic-spacing-stack-md;

  .options {
    display: flex;
    gap: $unnnic-spacing-inline-xs;

    @media only screen and (max-width: 1040px) {
      flex-direction: column;
      flex-wrap: wrap;
    }

    > * {
      flex: 1;
      padding: $unnnic-spacing-inset-md;
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-stack-sm;
      justify-content: space-between;
      border-radius: $unnnic-border-radius-sm;

      .channels {
        display: flex;
        justify-content: center;
        column-gap: $unnnic-spacing-inline-sm;

        img {
          height: $unnnic-icon-size-xl;
          cursor: pointer;
        }
      }

      .unnnic-button {
        width: 100%;
      }
    }
  }

  .options > *,
  .lastest-activities {
    box-shadow: $unnnic-shadow-level-separated;
  }

  .lastest-activities {
    flex: 1;
    padding: $unnnic-spacing-stack-sm $unnnic-spacing-inline-xs;
    min-height: 8.125rem;
    box-sizing: border-box;
    display: flex;
    border-radius: $unnnic-border-radius-sm;

    ::v-deep .hightlight {
      color: $unnnic-color-brand-weni-soft;
    }

    .content {
      height: 100%;
      overflow: auto;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      row-gap: $unnnic-spacing-stack-xs;
      position: absolute;
      align-content: flex-start;
      padding-right: $unnnic-spacing-inline-xl;
      width: 100%;
      box-sizing: border-box;

      > div {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: flex-start;

        .upper-case {
          text-transform: uppercase;
        }
      }
    }
  }
}
</style>
