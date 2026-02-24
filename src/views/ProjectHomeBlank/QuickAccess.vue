<!-- eslint-disable vue/no-v-html -->
<template>
  <section class="quick-access">
    <section class="quick-access__container">
      <UnnnicCard
        type="title"
        icon="flash_on"
        :title="$t('home.quick_access.title')"
        infoPosition="left"
        scheme="aux-orange"
        :info="$t('home.quick_access.info')"
      />

      <div class="options">
        <div class="add-channel u bg-neutral-snow">
          <div class="u font body-gt bold color-neutral-darkest">
            {{ $t('home.quick_access.add_channel.title') }}
          </div>

          <div class="channels">
            <RouterLink :to="appLink('wpp-demo')">
              <img src="@/assets/logos/whatsapp-demo.svg" />
            </RouterLink>

            <RouterLink :to="appLink('tg')">
              <img src="@/assets/logos/telegram.svg" />
            </RouterLink>

            <RouterLink :to="appLink('wwc')">
              <img src="@/assets/logos/weni-webchat.svg" />
            </RouterLink>
          </div>

          <UnnnicButton
            type="tertiary"
            size="small"
            iconLeft="add"
            @click="
              $router.push({
                name: 'integrations',
                params: { internal: ['r', 'apps', 'discovery'] },
              })
            "
          >
            {{ $t('home.quick_access.add_channel.button') }}
          </UnnnicButton>
        </div>

        <div class="invite-member u bg-neutral-snow">
          <div class="u font body-gt bold color-neutral-darkest">
            {{ $t('home.quick_access.invite_member.title') }}
          </div>

          <UnnnicInput
            ref="email"
            v-model="email"
            class="invite-input"
            :placeholder="$t('home.quick_access.invite_member.placeholder')"
            size="sm"
            :disabled="addingAuthorization"
            @keypress.enter="addAuthorization"
          ></UnnnicInput>

          <UnnnicButton
            type="tertiary"
            size="small"
            :loading="addingAuthorization"
            @click="addAuthorization"
          >
            {{ $t('home.quick_access.invite_member.button') }}
          </UnnnicButton>
        </div>
      </div>
    </section>

    <section class="quick-access__container">
      <UnnnicCard
        type="title"
        icon="wb_incandescent"
        :title="$t('home.quick_access.lastest_activities.title')"
        infoPosition="left"
        scheme="aux-pink"
        :info="$t('home.quick_access.lastest_activities.info')"
      />

      <div class="lastest-activities u bg-neutral-snow">
        <div class="content">
          <section
            v-show="loading"
            class="activity-loading"
          >
            <div
              v-for="(n, index) in 4"
              :key="index"
            >
              <UnnnicSkeletonLoading
                tag="span"
                height="20px"
                width="190px"
              />
              <UnnnicSkeletonLoading
                tag="span"
                height="16px"
                width="45px"
              />
            </div>
          </section>
          <div
            v-for="(activity, index) in activities"
            :key="index"
          >
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
          <section
            v-show="!complete || loading"
            ref="infinite-loading-element"
            class="activity-loading"
          >
            <div
              v-for="(n, index) in 1"
              :key="index"
            >
              <UnnnicSkeletonLoading
                tag="span"
                height="20px"
                width="190px"
              />
              <UnnnicSkeletonLoading
                tag="span"
                height="16px"
                width="45px"
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
import { getMoment } from '@/utils/lazyMoment';
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
      loading: false,
      next: null,
      complete: false,
      isInfiniteLoadingElementShowed: false,
      intersectionObserver: null,
      momentRef: null,
    };
  },

  watch: {
    isInfiniteLoadingElementShowed(isShowed) {
      if (isShowed && !this.loading && !this.complete) {
        this.loadFromInfiniteLoading();
      }
    },
  },

  mounted() {
    this.initMoment();
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isInfiniteLoadingElementShowed = entry.isIntersecting;
      });
    });

    this.intersectionObserver.observe(this.$refs['infinite-loading-element']);
  },

  beforeUnmount() {
    this.intersectionObserver.unobserve(this.$refs['infinite-loading-element']);
  },

  methods: {
    async initMoment() {
      this.momentRef = await getMoment(this.$i18n.locale);
    },
    fromNow(date) {
      const m = this.momentRef;
      return m ? m(date).locale(this.$i18n.locale).fromNow() : '';
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

    async loadFromInfiniteLoading() {
      try {
        await this.fetchActivities();
      } finally {
        setTimeout(() => {
          if (!this.complete && this.isInfiniteLoadingElementShowed) {
            this.loadFromInfiniteLoading();
          }
        });
      }
    },

    async fetchActivities() {
      this.loading = true;
      await projects
        .latestActivities({
          projectUuid: this.$store.getters.currentProject.uuid,
          limit: 20,
          next: this.next,
        })
        .then(({ data }) => {
          if (data.next) {
            const url = new URL(data.next);
            const cursor = url.searchParams.get('cursor');
            this.next = cursor;
          }

          const results = [...this.activities, ...data.results];
          this.activities = results.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (item) =>
                  item.user === value.user &&
                  item.created_at === value.created_at,
              ),
          );
          this.complete = data.next == null;
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.quick-access {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  gap: $unnnic-spacing-stack-md;
  align-items: start;

  &__container {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  .options {
    display: grid;
    grid-template-columns: 1fr 1fr; // DUAS COLUNAS
    gap: $unnnic-spacing-stack-md;

    > * {
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
    padding: $unnnic-spacing-stack-sm $unnnic-spacing-inline-xs;
    min-height: 8.125rem;
    max-height: 22rem;
    overflow: auto;
    box-sizing: border-box;

    border-radius: $unnnic-border-radius-sm;

    :deep(.hightlight) {
      color: $unnnic-color-brand-weni-soft;
    }

    .content {
      height: 100%;
      overflow: auto;
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-stack-xs;
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

    .activity-loading {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: $unnnic-spacing-sm;

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
