<template>
  <div class="unnnic-grid-span-6 quick-access">
    <unnnic-card
      type="title"
      icon="flash-1-3"
      :title="$t('home.quick_access.title')"
      info-position="bottom"
      scheme="aux-orange"
      :info="$t('home.quick_access.info')"
    />

    <div class="options">
      <div>
        <div class="title">{{ $t('home.quick_access.add_channel.title') }}</div>

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

        <unnnic-button type="terciary" size="small" icon-left="add-1">
          {{ $t('home.quick_access.add_channel.button') }}
        </unnnic-button>
      </div>

      <div>
        <div class="title">
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
      info-position="bottom"
      scheme="aux-pink"
      :info="$t('home.quick_access.lastest_activities.info')"
    />

    <div class="lastest-activities">
      <div :style="{ flex: 1, position: 'relative' }">
        <div class="content">
          <div v-for="i in 10" :key="i">
            <span class="hightlight">Matheus Soares</span> acabou de integrar
            inteligência de identificação e xingamento.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    };
  },

  methods: {
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

      .title {
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-primary;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
        font-weight: $unnnic-font-weight-bold;
      }

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
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;
    font-weight: $unnnic-font-weight-regular;
    display: flex;

    .hightlight {
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
    }
  }
}
</style>