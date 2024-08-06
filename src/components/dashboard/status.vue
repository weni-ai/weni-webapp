<template>
  <div class="weni-status">
    <UnnnicCard
      v-for="status in list"
      :key="`${status.service__type_service}:${status.id}`"
      :title="$t(`home.status.${status.service__type_service}`)"
      type="status"
      :scheme="statusSchemes[status.service__status.status]"
      :icon="statusIcons[status.service__type_service]"
      :description="
        status.service__status.intercurrence
          ? $t(`home.status.updated.${status.service__status.status}`, {
              time: timeAgo(status.service__status.intercurrence),
            })
          : $t('home.status.no_intercurrences_yet')
      "
      :status="$t(`home.status.title.${status.service__status.status}`)"
    />
  </div>
</template>

<script>
import { unnnicCallAlert } from '@weni/unnnic-system';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Status',
  data() {
    return {
      statusList: [],
      statusIcons: {
        type_service_chat: 'forum',
        type_service_inteligence: 'neurology',
        type_service_studio: 'ad',
        type_service_flows: 'account_tree',
      },
      loading: false,
      statusSchemes: {
        online: 'feedback-green',
        offline: 'feedback-red',
        intermittent: 'feedback-yellow',
        maintenance: 'feedback-blue',
      },
    };
  },
  mounted() {
    this.fetchStatus();
  },
  watch: {
    loading() {
      this.$emit('loadingStatus', this.loading);
    },
  },
  methods: {
    ...mapActions(['getStatus']),
    async fetchStatus() {
      try {
        this.loading = true;
        const response = await this.getStatus({
          projectUuid: this.currentProject.uuid,
        });
        this.statusList = response.data.results;
      } catch (e) {
        unnnicCallAlert({
          props: {
            text: this.$t('home.status_error'),
            title: 'Error',
            icon: 'check_circle',
            scheme: 'feedback-red',
            position: 'bottom-right',
            closeText: this.$t('close'),
          },
          seconds: 3,
        });
      } finally {
        this.loading = false;
      }
    },
    timeAgo(time) {
      const date = new Date(time);
      return getTimeAgo(date, this.profile.language);
    },
  },
  computed: {
    ...mapState({
      profile: (state) => state.Account.profile,
    }),

    ...mapGetters(['currentProject']),

    list() {
      const list = [];

      // register known services (also its ordering)
      const services = {
        type_service_flows: 'type_service_flows',
        type_service_studio: 'type_service_flows',
        type_service_inteligence: 'type_service_inteligence',
        type_service_chat: 'type_service_chat',
      };

      Object.keys(services).forEach((service) => {
        const serviceFound = this.statusList.find(
          (item) => item.service__type_service === services[service],
        );

        if (serviceFound) {
          list.push({
            ...serviceFound,
            service__type_service: service,
          });
        }
      });

      // if there is a service status that is unknown, add to list anyway
      this.statusList
        .filter((item) => {
          return !list.find(
            (service) =>
              service.service__type_service === item.service__type_service,
          );
        })
        .forEach((item) => list.push(item));

      return list;
    },
  },
};
</script>

<style lang="scss">
.weni-status {
  > * {
    background-color: $unnnic-color-neutral-lightest !important;
  }
  > :not(:last-child) {
    margin-bottom: $unnnic-spacing-stack-sm;
  }
}
</style>
