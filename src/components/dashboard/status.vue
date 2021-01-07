<template>
    <div class="weni-status">
        <unnic-card
          v-for="status in statusList"
          :key="status.id" :title="status.title"
          type="status"
          :scheme="status.service__status ? 'feedback-green' : 'feedback-red'"
          :icon="status.icon"
          :description="$t('home.status.updated', { time: timeAgo(status.service__last_updated) })"
          :status="status.service__status ? $t('home.status.working') : $t('home.status.not_working')" />
    </div>
</template>

<script>
import dashboard from '../../api/dashboard.js';
import unnic from 'unnic-system-beta';
import { getTimeAgo } from '../../utils/plugins/timeAgo';

export default {
  name: 'Status',
  components: { UnnicCard: unnic.UnnicCard },
  data() {
    return {
      status: [],
    };
  },
  mounted() {
    this.getStatus();
  },
  methods: {
    async getStatus() {
      const response = await dashboard.status();
      this.status = response.data.results;
    },
    timeAgo(time) {
      const date = new Date(time);
      return getTimeAgo(date);
    },
  },
  computed: {
    statusList() {
      const list = this.status.map(entry => {
        if (entry.service__url.includes('bothub')) return { ...entry, ...{ icon: 'science-fiction-robot-2', title: this.$t('home.status.ai') } };
        else if(entry.service__url.includes('push')) return { ...entry, ...{ icon: 'hierarchy-3-2', title: this.$t('home.status.flow') } };
        else if(entry.service__url.includes('rocket')) return { ...entry, ...{ icon: 'messaging-we-chat-3', title: this.$t('home.status.rc') } };
        return entry;
      });
      return list;
    },
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
    :not(:last-child) {
      margin-bottom: $unnic-spacing-stack-sm;
    }
  }
</style>