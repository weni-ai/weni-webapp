<template>
  <div
    class="right-sidebar__side-menu"
    :class="{ closed: isClosed }"
    @click.self="wantToClose"
  >
    <div :class="['right-sidebar__side-menu__content', { closed: isClosed }]">
      <template v-if="type === 'OrgSettings'">
        <div class="settings-header">
          <unnnic-icon
            icon="keyboard-arrow-left-1"
            scheme="neutral-darkest"
            clickable
            @click="close"
            :class="{ 'shake-horizontal': shakeCloseButton }"
          ></unnnic-icon>

          <unnnic-tab v-model="activeTab" :tabs="['first', 'second']">
            <template slot="tab-head-first">
              {{ $t('orgs.general') }}
            </template>

            <template slot="tab-head-second">
              {{ $t('orgs.security') }}
            </template>
          </unnnic-tab>
        </div>

        <update-org :org-uuid="orgUuid" :active-tab="activeTab" />
      </template>

      <template v-else>
        <div class="right-sidebar__side-menu__content__info">
          <unnnic-icon
            icon="keyboard-arrow-left-1"
            scheme="neutral-darkest"
            clickable
            @click="close"
            :class="{ 'shake-horizontal': shakeCloseButton }"
          ></unnnic-icon>

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

        <org-permissions :org-uuid="orgUuid" @close="close" />
      </template>

      <!-- <component
        v-show="!isLoading"
        class="right-sidebar__side-menu__component"
        :is="action.component"
        v-bind="action.props"
        @finish="action.onFinished($event)"
        @finish2FA="action.onFinished2FA($event)"
        @isLoading="isLoading = $event"
        :active-tab.sync="activeTab"
        @reload-organizations="$emit('reload-organizations')"
        @close="close"
      /> -->
    </div>
  </div>
</template>

<script>
import UpdateOrg from '../orgs/updateOrg.vue';
import OrgPermissions from '../orgs/orgPermissions.vue';

export default {
  components: {
    UpdateOrg,
    OrgPermissions,
  },

  props: {
    id: Number,

    type: {
      type: String,
      validator: (value) => ['OrgSettings', 'OrgManageUsers'].includes(value),
    },

    orgUuid: String,
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
      }

      return {};
    },
  },

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
        console.log(this.id);
        this.$store.dispatch('closeRightBar', this.id);

        window.dispatchEvent(new CustomEvent('showBottomRightOptions'));
      }, 200);
    },

    wantToClose() {
      this.shakeCloseButton = true;

      setTimeout(() => {
        this.shakeCloseButton = false;
      }, 1000);
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

.shake-horizontal {
  animation: shake-horizontal 1s cubic-bezier(0.455, 0.03, 0.515, 0.955) both;
}

@keyframes shake-horizontal {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70% {
    transform: translateX(-6px);
  }
  20%,
  40%,
  60% {
    transform: translateX(6px);
  }
  80% {
    transform: translateX(2px);
  }
  90% {
    transform: translateX(-2px);
  }
}
</style>
