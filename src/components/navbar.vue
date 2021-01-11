<template>
    <div class="weni-navbar">
        <unnic-dropdown>
            <unnic-icon
            class="weni-navbar__icon" 
            :clickable="true"
            icon="single-neutral-2"
            slot="trigger" />
            <unnic-dropdown-item v-if="isLogged()" class="weni-navbar__logout" @click="logout()"> 
                <unnic-icon icon="logout-1-1" /> {{ getTranslation('SIDEBAR.LOGOUT') }}
            </unnic-dropdown-item>
            <unnic-dropdown-item v-else  @click="login()"> 
                <unnic-icon icon="single-neutral-actions-1" /> {{ getTranslation('SIDEBAR.LOGIN') }}
            </unnic-dropdown-item>
        </unnic-dropdown>
    </div>    
</template>

<script>
import unnic from 'unnic-system-beta';

export default {
  name: 'Navbar',
  data() {
    return {
      profile: null,
    };
  },
  components: {
    UnnicIcon: unnic.UnnicIcon,
    UnnicDropdown: unnic.UnnicDropdown,
    UnnicDropdownItem: unnic.UnnicDropdownItem,
  },
  mounted() {
    this.getProfile();
  },
  methods: {
    login() {
      window.Luigi.auth().login();
    },
    logout() {
      window.Luigi.auth().logout();
    },
    isLogged() {
      const token = window.parent.Luigi.auth().store.getAuthData();
      return token && token.accessToken;
    },
    getTranslation(label) {
      return window.Luigi.getConfigValue('settings.customTranslationImplementation').getTranslation(label);
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

</style>