<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="right-sidebar__side-menu"
    :class="{ closed: isClosed }"
    @click.self="close"
  >
    <div :class="['right-sidebar__side-menu__content', { closed: isClosed }]">
      <template v-if="type === 'OrgSettings'">
        <div class="settings-header">
          <UnnnicIcon
            icon="keyboard_backspace"
            scheme="neutral-darkest"
            clickable
            @click="close"
          ></UnnnicIcon>

          <UnnnicTab
            v-model="activeTab"
            :tabs="['first', 'second']"
          >
            <template slot="tab-head-first">
              {{ $t('orgs.general') }}
            </template>

            <template slot="tab-head-second">
              {{ $t('orgs.security') }}
            </template>
          </UnnnicTab>
        </div>

        <UpdateOrg
          :orgUuid="orgUuid"
          :activeTab="activeTab"
        />
      </template>

      <template v-else>
        <div class="right-sidebar__side-menu__content__info">
          <UnnnicIcon
            icon="keyboard_backspace"
            scheme="neutral-darkest"
            clickable
            @click="close"
          ></UnnnicIcon>

          <div class="right-sidebar__side-menu__content__info__text">
            <h1 class="unnnic-font secondary title-sm bold">
              {{ texts.title }}
            </h1>

            <h2 class="unnnic-font secondary body-gt color-neutral-cloudy">
              {{ texts.description }}
            </h2>
          </div>
        </div>

        <div class="right-sidebar__side-menu__separator" />

        <OrgPermissions
          v-if="type === 'OrgManageUsers'"
          :orgUuid="orgUuid"
          @close="close"
        />

        <OrgPermissions
          v-else-if="type === 'OrgReadUsers'"
          :orgUuid="orgUuid"
          @close="close"
          type="read"
        />

        <ProjectUsers
          v-else-if="type === 'ProjectManageUsers'"
          type="manage"
          :projectUuid="projectUuid"
          :projectName="projectName"
          :authorizations="projectAuthorizations"
          :pendingAuthorizations="projectPendingAuthorizations"
          :hasChat="projectHasChat"
          v-on="$listeners"
        />

        <ProjectUsers
          v-else-if="type === 'ProjectReadUsers'"
          type="read"
          :projectUuid="projectUuid"
          :projectName="projectName"
          :authorizations="projectAuthorizations"
          :pendingAuthorizations="projectPendingAuthorizations"
          :hasChat="projectHasChat"
        />

        <Notifications
          v-else-if="type === 'Notifications'"
          :orgUuid="orgUuid"
          @close="close"
        />

        <ProjectSettings
          v-else-if="type === 'ProjectSettings'"
          :projectUuid="projectUuid"
          :projectName="projectName"
          :projectDescription="projectDescription"
          :projectTimezone="projectTimezone"
          :authorizations="projectAuthorizations"
          :pendingAuthorizations="projectPendingAuthorizations"
          :hasChat="projectHasChat"
          v-on="$listeners"
          @updated-project="onUpdateProject"
        />
      </template>
    </div>
  </div>
</template>

<script>
import UpdateOrg from './updateOrg.vue';
import OrgPermissions from './orgPermissions.vue';
import ProjectUsers from './ProjectUsers.vue';
import Notifications from './Notifications.vue';
import ProjectSettings from './ProjectSettings.vue';

export default {
  components: {
    UpdateOrg,
    OrgPermissions,
    ProjectUsers,
    Notifications,
    ProjectSettings,
  },

  props: {
    id: Number,

    type: {
      type: String,
      validator: (value) =>
        [
          'OrgSettings',
          'OrgManageUsers',
          'OrgReadUsers',
          'ProjectManageUsers',
          'ProjectReadUsers',
          'Notifications',
          'ProjectSettings',
        ].includes(value),
    },

    orgUuid: String,

    projectUuid: String,
    projectName: String,
    projectDescription: String,
    projectTimezone: String,
    projectAuthorizations: Array,
    projectPendingAuthorizations: Array,
    projectHasChat: Boolean,
  },

  data() {
    return {
      // isLoading: false,
      isClosed: true,
      shakeCloseButton: false,
      activeTab: 'first',
    };
  },

  computed: {
    texts() {
      if (this.type === 'OrgManageUsers') {
        return {
          title: this.$t('orgs.manage_members'),
          description: this.$t('orgs.manage_members_description'),
        };
      } else if (this.type === 'OrgReadUsers') {
        return {
          title: this.$t('orgs.view_members'),
          description: this.$t('orgs.view_members_description'),
        };
      } else if (this.type === 'ProjectManageUsers') {
        return {
          title: this.$t('orgs.manage_members'),
          description: this.$t('orgs.manage_members_description'),
        };
      } else if (this.type === 'ProjectReadUsers') {
        return {
          title: this.$t('projects.view_members'),
          description: this.$t('projects.view_members_description'),
        };
      } else if (this.type === 'Notifications') {
        return {
          title: this.$t('rightbar.notifications.title'),
          description: this.$t('rightbar.notifications.description'),
        };
      } else if (this.type === 'ProjectSettings') {
        return {
          title: this.$t('projects.edit_name'),
          description: '',
        };
      }

      return {};
    },
  },

  created() {},

  mounted() {
    setTimeout(() => {
      this.isClosed = false;

      window.dispatchEvent(new CustomEvent('hideBottomRightOptions'));
    });
  },

  methods: {
    close() {
      if (this.type === 'manage-members') {
        this.props?.onFinished?.();
      }

      this.isClosed = true;

      setTimeout(() => {
        this.$store.dispatch('closeRightBar', this.id);
      }, 200);
    },
    onUpdateProject(data) {
      this.$emit('updated-project', data);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.settings-header {
  display: flex;
  align-items: center;

  .tab {
    width: 100%;

    ::v-deep .tab-header {
      margin-left: $unnnic-spacing-inline-md;
      margin-bottom: 0;
    }
  }
}

.right-sidebar__side-menu {
  position: fixed;
  transition: background-color 0.2s;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 4;
  display: flex;
  justify-content: flex-end;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;

  &.closed {
    background-color: rgba(0, 0, 0, 0);
  }

  &__separator {
    border: 1px solid $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0 1rem 0;
  }

  &__component {
    flex: 1;
  }

  &__content {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    box-sizing: border-box;
    transition: right 0.2s;

    width: 43.125rem;
    padding: 32px;
    background-color: white;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;

    &.closed {
      right: -43.125rem;
    }

    h1,
    h2 {
      margin: 0;
    }

    &__info {
      display: flex;
      &__text {
        flex: 1;
        margin-left: 1rem;
      }
    }
  }
}
</style>
