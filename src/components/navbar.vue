<template>
    <div class="weni-navbar">
        <unnic-dropdown>
            <unnic-icon
            class="weni-navbar__icon" 
            :clickable="true"
            icon="single-neutral-2"
            slot="trigger" />
            <unnic-dropdown-item v-if="isLogged()" @click="account()"> 
                <unnic-icon icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.ACCOUNT') }}
            </unnic-dropdown-item>
            <unnic-dropdown-item v-if="isLogged()" class="weni-navbar__logout" @click="logoutModalOpen = true"> 
                <unnic-icon icon="logout-1-1" /> {{ getTranslation('SIDEBAR.LOGOUT') }}
            </unnic-dropdown-item>
            <unnic-dropdown-item v-else  @click="login()"> 
                <unnic-icon icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.LOGIN') }}
            </unnic-dropdown-item>
        </unnic-dropdown>
        <unnic-modal 
          :show-modal="logoutModalOpen"
          has-button
          close-icon
          scheme="feedback-red"
          modal-icon="logout-1-1"
          :description="getTranslation('SIDEBAR.LOGOUT_MESSAGE')"
          :text="getTranslation('SIDEBAR.LOGOUT_TITLE')"
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
  components: {
    UnnicIcon: unnic.UnnicIcon,
    UnnicDropdown: unnic.UnnicDropdown,
    UnnicDropdownItem: unnic.UnnicDropdownItem,
    unnicButton: unnic.UnnicButton,
    unnicModal: unnic.UnnicModal,
  },
  mounted() {
    // this.getProfile();
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
      return window.Luigi.navigation().navigate('/dashboard/account');
    },
    async getProfile() {
      const authData = window.Luigi.auth().store.getAuthData();
      this.profile = await window.Luigi.getConfigValue('auth.openIdConnect.userInfoFn')(null, authData);
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
    background-color: #F4F6F8;
    justify-content: flex-end;;

    &__icon {
        padding: 8px;
        border-radius: 50%;
        background-color: $unnic-color-background-snow;
        color: $unnic-color-neutral-clean;
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