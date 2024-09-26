<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="right-sidebar__side-menu"
    :class="{ closed: isClosed }"
    @click.self="close"
  >
    <div
      :class="[
        'right-sidebar__side-menu__content',
        {
          closed: isClosed,
          'right-sidebar__side-menu__content--size-sm': [
            'Notifications',
            'LearningCenter',
          ].includes(type),
        },
      ]"
    >
      <template v-if="type === 'OrgSettings'">
        <div class="settings-header">
          <UnnnicIcon
            icon="keyboard_backspace"
            scheme="neutral-darkest"
            clickable
            @click="close"
          ></UnnnicIcon>

          <UnnnicTab
            :modelValue="activeTab"
            @change="activeTab = $event"
            :tabs="['first', 'second']"
          >
            <template #tab-head-first>
              {{ $t('orgs.general') }}
            </template>

            <template #tab-head-second>
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
          <div class="right-sidebar__side-menu__content__info__text">
            <h1>
              {{ texts.title }}
            </h1>

            <h2 class="unnnic-font secondary body-gt color-neutral-cloudy">
              {{ texts.description }}
            </h2>
          </div>

          <UnnnicIcon
            class="right-sidebar__side-menu__content__info__icon"
            icon="arrow_back"
            scheme="neutral-cloudy"
            clickable
            @click="close"
          />
        </div>

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
          v-bind="$attrs"
          type="manage"
          :projectUuid="projectUuid"
          :projectName="projectName"
          :authorizations="projectAuthorizations"
          :pendingAuthorizations="projectPendingAuthorizations"
          :hasChat="projectHasChat"
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
          v-bind="$attrs"
          :projectUuid="projectUuid"
          :projectName="projectName"
          :projectDescription="projectDescription"
          :projectTimezone="projectTimezone"
          :authorizations="projectAuthorizations"
          :pendingAuthorizations="projectPendingAuthorizations"
          :hasChat="projectHasChat"
          @updated-project="onUpdateProject"
        />

        <LearningCenter
          v-else-if="type === 'LearningCenter'"
          @close="close"
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
import LearningCenter from './LearningCenter.vue';

export default {
  components: {
    UpdateOrg,
    OrgPermissions,
    ProjectUsers,
    Notifications,
    ProjectSettings,
    LearningCenter,
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
          'LearningCenter',
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
          title: this.$t('news.title'),
          description: '',
        };
      } else if (this.type === 'ProjectSettings') {
        return {
          title: this.$t('projects.edit_name'),
          description: '',
        };
      } else if (this.type === 'LearningCenter') {
        return {
          title: this.$t('learning_center.title'),
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
.settings-header {
  display: flex;
  align-items: center;

  .tab {
    width: 100%;

    :deep(.tab-header) {
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

    &.right-sidebar__side-menu__content--size-sm {
      $content-width: 26 * $unnnic-font-size;

      width: $content-width;
      padding: $unnnic-spacing-md;
    }

    &.closed {
      right: -43.125rem;
    }

    h1,
    h2 {
      margin: 0;
    }

    &__info {
      padding: $unnnic-spacing-md;
      padding-bottom: $unnnic-spacing-md - $unnnic-border-width-thinner;
      margin: -$unnnic-spacing-lg;
      margin-bottom: $unnnic-spacing-md;
      border-bottom: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-soft;

      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-sm;

      &__icon {
        transform: rotate(180deg);
      }

      &__text {
        flex: 1;

        h1 {
          color: $unnnic-color-neutral-darkest;
          font-family: $unnnic-font-family-secondary;
          font-weight: $unnnic-font-weight-bold;
          font-size: $unnnic-font-size-title-sm;
          line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
        }
      }
    }

    &.right-sidebar__side-menu__content--size-sm
      .right-sidebar__side-menu__content__info {
      margin-left: -$unnnic-spacing-md;
      margin-top: -$unnnic-spacing-md;
      margin-right: -$unnnic-spacing-md;
    }
  }
}
</style>
