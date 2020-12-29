<template>
    <div class="weni-sidebar">
        <unnic-icon class="weni-sidebar__icon" :clickable="true" @click="onClick" icon="single-neutral-actions-1" />
        <div> {{ isLogged() ? 'Logout' : 'Login' }} </div>
    </div>    
</template>

<script>
import unnic from 'unnic-system-beta';
export default {
    name: 'Navbar',
    components: {
        UnnicIcon: unnic.UnnicIcon,
    },
    methods: {
        onClick() {
            if (this.isLogged()) window.parent.Luigi.auth().logout();
            else window.parent.Luigi.auth().login();
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

.weni-sidebar {
    padding: 24px;
    padding-left: 0;
    display: flex;
    background-color: #F4F6F8;
    justify-content: right;

    &__icon {
        padding: 8px;
        border-radius: 50%;
        background-color: pink;
    }
}

</style>