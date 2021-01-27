<template>
    <div class="weni-status">
        <unnic-card
          v-for="status in statusList"
          :key="status.id"
          :title="$t(`home.status.${status.service__type_service}`)"
          type="status"
          :scheme="status.service__status ? 'feedback-green' : 'feedback-red'"
          :icon="statusIcons[status.service__type_service]"
          :description="$t('home.status.updated', { time: timeAgo(status.service__last_updated) })"
          :status="status.service__status ? $t('home.status.working') : $t('home.status.not_working')" />
    </div>
</template>

<script>
import dashboard from '../../api/dashboard.js';
import unnic from 'unnic-system-beta';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import { mapGetters } from 'vuex';

export default {
  name: 'Status',
  components: { UnnicCard: unnic.UnnicCard },
  data() {
    return {
      statusList: [],
      statusIcons: {
        'type_service_chat': 'messaging-we-chat-3',
        'type_service_ai': 'science-fiction-robot-2',
        'type_service_flow': 'hierarchy-3-2'
      },
    };
  },
  mounted() {
    this.getStatus();
  },
  methods: {
    async getStatus() {
      try {
        const response = await dashboard.status();
        this.statusList = response.data.results;
      } catch(e) {
        unnic.callAlert({ props: {
          text: this.$t('home.status_error'),
          title: 'Error',
          icon: 'check-circle-1-1',
          scheme: 'feedback-red',
          position: 'bottom-right',
          closeText: this.$t('close'),
        }, seconds: 3 });
      }
    },
    timeAgo(time) {
      const date = new Date(time);
      return getTimeAgo(date, this.getCurrentLanguage);
    },
  },
  computed: {
    ...mapGetters(['getCurrentLanguage']),
  }
};
</script>

<style lang="scss">
  @import '~unnic-system-beta/src/assets/scss/unnic.scss';
  @import '~unnic-system-beta/dist/unnic.css';
  .weni-status {
    > * {
      background-color: $unnic-color-neutral-lightest !important;
    }
    > :not(:last-child) {
      margin-bottom: $unnic-spacing-stack-sm;
    }
  }
</style>