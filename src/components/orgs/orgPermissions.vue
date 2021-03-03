<template>
    <div class="weni-org-permissions">
        <org-role
          v-for="user in permissions"
          :key="user.uuid"
          :email="user.user__username"
          :name="user.user__username" />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import OrgRole from './orgRole.vue';

export default {
  name: 'OrgPermissions',
  components: { OrgRole },
  props: {
    org: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      permissions: [],
    };
  },
  mounted() {
    this.fetchPermissions();
  },
  methods: {
    ...mapActions(['getMembers']),
    async fetchPermissions() {
      const response = await this.getMembers({ uuid: this.org.uuid });
      this.permissions = response.data.results;
    }
  }
}
</script>