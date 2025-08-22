<template>
  <section v-show="pages.includes($route.name)" class="container">
    <img
      v-if="loading"
      class="logo"
      src="../assets/LogoWeniAnimada4.svg"
    />

    <iframe
      v-show="!loading"
      ref="iframe"
      class="container container--full-height"
      allow="clipboard-read; clipboard-write;"
      frameborder="0"
      @load="handleLoad"
    ></iframe>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import getEnv from '../utils/env';

export default {
  name: 'SystemGallery',

  data() {
    return {
      pages: ['gallery'],
      loading: true,
      src: '',
      alreadyInitialized: false,
    };
  },

  methods: {
    handleLoad(event) {
      if (event.srcElement.src === this.src) {
        this.loading = false;
      }
    },

    setSrc(src) {
      this.loading = true;

      const url = new URL(src);

      Object.entries(this.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      this.src = url.toString();
      this.$refs.iframe.setAttribute('src', this.src);
    },

    loadIframe() {
      this.alreadyInitialized = true;

      this.setSrc(getEnv('MODULES_YAML').gallery);
    },
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    ...mapState({
      accountProfile: (state) => state.Account.profile,
    }),

    params() {
      const accessToken = `Bearer ${this.$keycloak.token}`;

      const locales = {
        'pt-br': 'pt-BR',
        'es': 'es-ES',
        'en': 'en-US',
      };

      return {
        embedded_within: 'Weni Platform',
        org_uuid: this.currentOrg?.uuid,
        project_uuid: this.currentProject?.uuid,
        locale: locales[this.$i18n.locale],
        user_email: this.accountProfile?.email,
        access_token: accessToken,
      };
    },
  },

  watch: {
    'params': {
      deep: true,
      handler() {
        this.alreadyInitialized = false;

        if (this.pages.includes(this.$route.name)) {
          this.$nextTick(() => {
            this.loadIframe();
          });
        }
      },
    },

    '$route.fullPath': {
      immediate: true,
      handler() {
        if (this.pages.includes(this.$route.name) && !this.alreadyInitialized) {
          this.$nextTick(() => {
            this.loadIframe();
          });
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  height: auto;

  &--full-height {
    height: 100%;
  }

  .logo {
    max-width: 4 * $unnnic-font-size;
    max-height: 4 * $unnnic-font-size;
  }
}
</style>
