<template>
  <div class="weni-status">
    <unnnic-card
      v-for="status in statusList"
      :key="status.id"
      :title="$t(`home.status.${status.service__type_service}`)"
      type="status"
      :scheme="statusSchemes[status.service__status.status]"
      :icon="statusIcons[status.service__type_service]"
      :description="
        $t(`home.status.updated.${status.service__status.status}`, {
          time: timeAgo(status.service__status.intercurrence),
        })
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
  name: 'Status',
  data() {
    return {
      statusList: [],
      statusIcons: {
        type_service_chat: 'messaging-we-chat-3',
        type_service_inteligence: 'science-fiction-robot-2',
        type_service_flows: 'hierarchy-3-2',
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
            icon: 'check-circle-1-1',
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
  },
};
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
.weni-status {
  > * {
    background-color: $unnnic-color-neutral-lightest !important;
  }
  > :not(:last-child) {
    margin-bottom: $unnnic-spacing-stack-sm;
  }
}
</style>
