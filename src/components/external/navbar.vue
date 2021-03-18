<template>
    <div :class="['weni-navbar', `weni-navbar--theme-${theme}`]">
        <project-select v-if="theme == 'normal' && currentOrg()" :key="orgUpdate" class="weni-navbar__select" :org="currentOrg()" />
        <unnnic-input v-if="theme == 'normal'" size="sm" class="weni-navbar__search" icon-left="search-1" />
        <unnnic-icon v-if="theme == 'normal'" icon="vip-crown-queen-2" class="weni-navbar__item weni-navbar__item--alert" />
        <unnnic-icon v-if="theme == 'normal'" icon="alarm-bell-3" class="weni-navbar__item" />
        <div
          v-if="theme == 'secondary'"
          class="weni-navbar__logo unnnic--clickable">
          <img
            src="../../assets/brand-name.svg"
            @click="goHome()">
        </div>
        <unnnic-dropdown position="bottom-left" :open.sync="dropdownOpen">
          <div
            :style="imageBackground"
            class="weni-navbar__icon unnnic--clickable"
            :clickable="true"
            slot="trigger">
            <unnnic-icon
              v-if="!imageBackground"
              icon="single-neutral-2" />
            </div>
            <unnnic-dropdown-item v-if="isLogged()" @click="account(); dropdownOpen = false"> 
                <div class="weni-navbar__dropdown">
                  <unnnic-icon class="weni-navbar__dropdown__icon" size="sm" icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.ACCOUNT') }}
                </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-if="isLogged()" @click="orgs(); dropdownOpen = false">
              <div class="weni-navbar__dropdown">
                <unnnic-icon size="sm" class="weni-navbar__dropdown__icon" icon="button-refresh-arrows-1" /> {{ getTranslation('SIDEBAR.CHANGE_ORG') }}
              </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-if="isLogged()" class="weni-navbar__logout" @click="logoutModalOpen = true; dropdownOpen = false">
              <div class="weni-navbar__dropdown">
                <unnnic-icon size="sm" class="weni-navbar__dropdown__icon" icon="logout-1-1" /> {{ getTranslation('SIDEBAR.LOGOUT') }}
              </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-else  @click="login(); dropdownOpen = false;"> 
              <div class="weni-navbar__dropdown">
                <unnnic-icon class="weni-navbar__dropdown__icon" size="sm" icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.LOGIN') }}
              </div>
            </unnnic-dropdown-item>
        </unnnic-dropdown>
        <unnnic-modal 
          :show-modal="logoutModalOpen"
          has-button
          close-icon
          scheme="feedback-red"
          modal-icon="logout-1-1"
          :description="getTranslation('SIDEBAR.LOGOUT_MESSAGE')"
          :text="getTranslation('SIDEBAR.LOGOUT')"
          @close="logoutModalOpen = false">
          <unnnic-button
            slot="options"
            @click="logoutModalOpen = false"
            type="terciary">
              {{ getTranslation('SIDEBAR.CANCEL') }}
            </unnnic-button>
          <unnnic-button
            class="weni-button-danger"
            slot="options"
            @click="logout()">
              {{ getTranslation('SIDEBAR.LOGOUT') }}
            </unnnic-button>
        </unnnic-modal>
    </div>    
</template>

<script>
import { unnnicIcon, unnnicDropdown, unnnicDropdownItem, unnnicButton, unnnicModal, unnnicInput } from 'unnic-system-beta';
import ProjectSelect from './ProjectSelect';

export default {
  name: 'Navbar',
  data() {
    return {
      profile: null,
      logoutModalOpen: false,
      dropdownOpen: false,
    };
  },
  props: {
    update: {
      type: String,
      default: null,
    },
    orgUpdate: {
      type: String,
      default: null,
    },
    theme: {
      type: String,
      default: 'normal',
    },
  },
  components: { 
    unnnicIcon,
    unnnicDropdown,
    unnnicDropdownItem,
    unnnicButton,
    unnnicModal,
    unnnicInput,
    ProjectSelect,
  },
  mounted() {
    this.getProfile();
  },
  watch: {
    mustUpdate() {
      this.getProfile();
    }
  },
  computed: {
    imageBackground() {
      if(!(this.profile && this.profile.photo)) return null;
      return `background-image: url('${this.profile.photo}')`;
    },
    mustUpdate() {
      return `${this.update}`
    },
  },
  methods: {
    currentOrg() {
      const org =  window.localStorage.getItem('org');
      try {
        return JSON.parse(org);
      } catch(e) {
        return null;
      }
    },
    goHome() {
      window.Luigi.navigation().navigate('/home/index');
    },
    login() {
      window.Luigi.auth().login();
    },
    logout() {
      this.logoutModalOpen = false;
      window.Luigi.auth().logout();
    },
    isLogged() {
      const token = window.parent.Luigi.auth().store.getAuthData();
      return token && token.accessToken;
    },
    getTranslation(label) {
      return window.Luigi.getConfigValue('settings.customTranslationImplementation').getTranslation(label);
    },
    account() {
      window.Luigi.navigation().navigate('/account/edit');
    },
    orgs() {
      window.Luigi.navigation().navigate('/orgs/list');
    },
    async getProfile() {
      const authData = window.Luigi.auth().store.getAuthData();
      try {
        this.profile = await window.Luigi.getConfigValue('auth.openIdConnect.userInfoFn')(null, authData);
      } catch(e) {
        console.log(e);
      }
    },
  },
}
</script>

<style lang="scss">
@import '~unnic-system-beta/src/assets/scss/unnnic.scss';
@import '~unnic-system-beta/dist/unnnic.css';

.weni-navbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &--theme {
      &-normal {
        background-color: #F4F6F8;
        padding: $unnnic-inset-md $unnnic-inset-md $unnnic-inset-md 0;
      }

      &-secondary {
        background-color: white;
        padding: $unnnic-inset-md;
      }
    }

    &__logo {
      height: $unnnic-inset-md;
      flex: 1;
      img {
        height: 100%;
      }
    }

    &__search {
      margin: 0 $unnnic-inline-md 0 0;
      flex: 1;
    }

    &__select {
      margin: 0 $unnnic-inline-sm 0 0;
    }

    &__item {
      margin-right: $unnnic-inline-md;
      
      &--alert {
        color: $unnnic-color-feedback-yellow;  
      }
    }

    &__dropdown {
      text-align: center;
      white-space: nowrap;
      display: flex;
      align-items: center;

      &__icon {
        margin-right: $unnnic-inline-xs;
      }
    }

    &__icon {
        width: $unnnic-avatar-size-sm;
        height: $unnnic-avatar-size-sm;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: $unnnic-color-background-snow;
        color: $unnnic-color-neutral-clean;
        background-size: cover;
    }

    &__logout {
        color: $unnnic-color-feedback-red !important;
    }
}

.weni-button-danger {
    background-color: $unnnic-color-feedback-red !important; 
    color: $unnnic-color-neutral-snow !important;
}

</style>