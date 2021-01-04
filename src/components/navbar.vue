<template>
    <div class="weni-navbar">
        <unnic-dropdown>
            <unnic-icon 
            class="weni-navbar__icon" 
            :clickable="true"
            icon="single-neutral-actions-1"
            slot="trigger" />
            <unnic-dropdown-item v-if="isLogged()" class="weni-navbar__logout" @click="logout()"> 
                <unnic-icon icon="logout-1-1" /> Logout
            </unnic-dropdown-item>
            <unnic-dropdown-item v-else  @click="login()"> 
                <unnic-icon icon="single-neutral-actions-1" /> Login
            </unnic-dropdown-item>
        </unnic-dropdown>
    </div>    
</template>

<script>
import unnic from 'unnic-system-beta';
export default {
  name: 'Navbar',
  components: {
    UnnicIcon: unnic.UnnicIcon,
    UnnicDropdown: unnic.UnnicDropdown,
    UnnicDropdownItem: unnic.UnnicDropdownItem,
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
  },
}
</script>

<style lang="scss">
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
        background-color: pink;
    }

    &__logout {
        color: #FF4545;
    }
}

</style>