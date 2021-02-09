<template>
    <div class="weni-navbar">
        <unnnic-icon icon="vip-crown-queen-2" class="weni-navbar__item weni-navbar__item--alert" />
        <unnnic-icon icon="alarm-bell-3" class="weni-navbar__item" />
        <unnnic-dropdown position="bottom-left">
          <div
            :style="imageBackground"
            class="weni-navbar__icon unnnic--clickable" 
            :clickable="true"
            slot="trigger">
            <unnnic-icon
              v-if="!imageBackground"
              icon="single-neutral-2" />
            </div>
            <unnnic-dropdown-item v-if="isLogged()" @click="account()"> 
                <div class="weni-navbar__dropdown">
                  <unnnic-icon class="weni-navbar__dropdown__icon" size="sm" icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.ACCOUNT') }}
                </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-if="isLogged()" class="weni-navbar__logout" @click="logoutModalOpen = true">
              <div class="weni-navbar__dropdown">
                <unnnic-icon size="sm" class="weni-navbar__dropdown__icon" icon="logout-1-1" /> {{ getTranslation('SIDEBAR.LOGOUT') }}
              </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-else  @click="login()"> 
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
import { unnnicIcon, unnnicDropdown, unnnicDropdownItem, unnnicButton, unnnicModal } from 'unnic-system-beta';

export default {
  name: 'Navbar',
  data() {
    return {
      profile: null,
      logoutModalOpen: false,
    };
  },
  props: {
    update: {
      type: String,
      default: null,
    },
  },
  components: { 
    unnnicIcon,
    unnnicDropdown,
    unnnicDropdownItem,
    unnnicButton,
    unnnicModal 
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
      return window.Luigi.navigation().navigate('/account/edit');
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
    padding: 24px;
    padding-left: 0;
    display: flex;
    align-items: center;
    background-color: #F4F6F8;
    justify-content: flex-end;

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