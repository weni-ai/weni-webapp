<template>
    <div class="weni-navbar">
        <unnic-icon icon="alarm-bell-3" class="weni-navbar__item" />
        <unnic-icon icon="vip-crown-queen-2" class="weni-navbar__item weni-navbar__item--alert" />
        <unnic-dropdown position="bottom-left">
          <div
            :style="imageBackground"
            class="weni-navbar__icon unnic--clickable" 
            :clickable="true"
            slot="trigger">
            <unnic-icon
              v-if="!imageBackground"
              icon="single-neutral-2" />
            </div>
            <unnic-dropdown-item v-if="isLogged()" @click="account()"> 
                <div class="weni-navbar__dropdown">
                  <unnic-icon class="weni-navbar__dropdown__icon" size="sm" icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.ACCOUNT') }}
                </div>
            </unnic-dropdown-item>
            <unnic-dropdown-item v-if="isLogged()" class="weni-navbar__logout" @click="logoutModalOpen = true">
              <div class="weni-navbar__dropdown">
                <unnic-icon size="sm" class="weni-navbar__dropdown__icon" icon="logout-1-1" /> {{ getTranslation('SIDEBAR.LOGOUT') }}
              </div>
            </unnic-dropdown-item>
            <unnic-dropdown-item v-else  @click="login()"> 
              <div class="weni-navbar__dropdown">
                <unnic-icon class="weni-navbar__dropdown__icon" size="sm" icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.LOGIN') }}
              </div>
            </unnic-dropdown-item>
        </unnic-dropdown>
        <unnic-modal 
          :show-modal="logoutModalOpen"
          has-button
          close-icon
          scheme="feedback-red"
          modal-icon="logout-1-1"
          :description="getTranslation('SIDEBAR.LOGOUT_MESSAGE')"
          :text="getTranslation('SIDEBAR.LOGOUT')"
          @close="logoutModalOpen = false">
          <unnic-button
            slot="options"
            @click="logoutModalOpen = false"
            type="terciary">
              {{ getTranslation('SIDEBAR.CANCEL') }}
            </unnic-button>
          <unnic-button
            class="weni-button-danger"
            slot="options"
            @click="logout()">
              {{ getTranslation('SIDEBAR.LOGOUT') }}
            </unnic-button>
        </unnic-modal>
    </div>    
</template>

<script>
import unnic from 'unnic-system-beta';

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
    UnnicIcon: unnic.UnnicIcon,
    UnnicDropdown: unnic.UnnicDropdown,
    UnnicDropdownItem: unnic.UnnicDropdownItem,
    unnicButton: unnic.UnnicButton,
    unnicModal: unnic.UnnicModal,
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
@import '~unnic-system-beta/src/assets/scss/unnic.scss';
@import '~unnic-system-beta/dist/unnic.css';

.weni-navbar {
    padding: 24px;
    padding-left: 0;
    display: flex;
    align-items: center;
    background-color: #F4F6F8;
    justify-content: flex-end;

    &__item {
      margin-right: $unnic-inline-md;
      
      &--alert {
        color: $unnic-color-feedback-yellow;  
      }
    }

    &__dropdown {
      text-align: center;
      white-space: nowrap;
      display: flex;
      align-items: center;

      &__icon {
        margin-right: $unnic-inline-xs;
      }
    }

    &__icon {
        width: $unnic-avatar-size-sm;
        height: $unnic-avatar-size-sm;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: $unnic-color-background-snow;
        color: $unnic-color-neutral-clean;
        background-size: cover;
    }

    &__logout {
        color: $unnic-color-feedback-red !important;
    }
}

.weni-button-danger {
    background-color: $unnic-color-feedback-red !important; 
    color: $unnic-color-neutral-snow !important;
}

</style>